import { readFileSync } from 'fs';
import Fuse from 'fuse.js';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();

const anthropicClient = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

// Local deterministic matcher: fuzzy merchant match + amount + recency scoring
function normalizeMerchant(s) {
  if (!s) return '';
  const map = {
    "macti": "mcdonalds",
    "magdi": "mcdonalds",
    "mcd": "mcdonalds",
    "mc d": "mcdonalds",
    "mcdonald": "mcdonalds",
    "wholefoods": "whole foods",
    "whole food": "whole foods",
    "wf": "whole foods",
    "tgt": "target",
    "walmart": "walmart",
    "starbucks": "starbucks"
  };
  const s0 = s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  if (map[s0]) return map[s0];
  return s0;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

async function matchTransaction(parsedEntry, transcript, entryTime, transactions) {
  // Ensure transactions passed; if not, try to load the file
  let txnList = Array.isArray(transactions) ? transactions.slice() : [];
  if (!txnList.length) {
    try {
      const bankData = JSON.parse(readFileSync('./files/bank_transactions.json', 'utf-8'));
      txnList = bankData.transactions || [];
    } catch (e) {
      txnList = [];
    }
  }

  // Parse numeric amount
  const userAmount = Number(parsedEntry.amount) || null;
  // Extract merchant from merchant field or context field
  let userMerchantRaw = parsedEntry.merchant || parsedEntry.merchant_name || '';
  if (!userMerchantRaw && parsedEntry.context) {
    // Try to extract merchant from context (e.g., "Whole Foods grocery shopping" -> "Whole Foods")
    const contextLower = parsedEntry.context.toLowerCase();
    const commonMerchants = ['whole foods', 'walmart', 'target', 'starbucks', 'amazon', 'uber', 'mcdonalds', 'nike'];
    for (const merchant of commonMerchants) {
      if (contextLower.includes(merchant)) {
        userMerchantRaw = merchant;
        break;
      }
    }
  }
  const userMerchant = normalizeMerchant(userMerchantRaw);

  // Sort by recency and only look at most recent 15 transactions
  const sorted = txnList.sort((a, b) => {
    const da = new Date(a.datetime || `${a.date}T${a.time || '00:00:00'}`);
    const db = new Date(b.datetime || `${b.date}T${b.time || '00:00:00'}`);
    return db - da;
  }).slice(0, 15);

  // Build a merchant name index for fuzzy lookups (Fuse.js)
  const merchantNames = Array.from(new Set(sorted.map(t => normalizeMerchant(t.merchant || t.description || '')))).filter(Boolean);
  let fuse = null;
  if (merchantNames.length) {
    fuse = new Fuse(merchantNames, {
      includeScore: true,
      threshold: 0.45,
      distance: 100,
      minMatchCharLength: 2
    });
  }

  let best = null;
  let secondBest = null;
  const candidates = [];

  const now = entryTime ? new Date(entryTime) : new Date();

  for (const t of sorted) {
    const txAmt = Number(t.amount);
    if (isNaN(txAmt)) continue;

    // amount diff percent
    const diffPct = userAmount ? (Math.abs(txAmt - userAmount) / Math.max(txAmt, 0.01)) * 100 : 100;

    // amount score
    let amountScore = 0;
    if (diffPct <= 1) amountScore = 100;
    else if (diffPct <= 5) amountScore = 90;
    else if (diffPct <= 10) amountScore = 80;
    else if (diffPct <= 20) amountScore = 50;
    else amountScore = 0; // won't match

    if (amountScore === 0) continue;

    // merchant score (fuzzy + Fuse.js boost)
    const txMerchantNorm = normalizeMerchant(t.merchant || t.description || '');
    let merchantScore = 0;
    if (!userMerchant) {
      merchantScore = 40; // unknown user merchant
    } else {
      // First, quick exactness / containment checks
      if (txMerchantNorm === userMerchant) {
        merchantScore = 100;
      } else if (txMerchantNorm.includes(userMerchant) || userMerchant.includes(txMerchantNorm)) {
        merchantScore = 95;
      } else {
        // Use Fuse.js to find if userMerchant maps near this transaction merchant
        if (fuse) {
          const fuseResults = fuse.search(userMerchant, { limit: 6 });
          const candidateSet = new Set(fuseResults.map(r => r.item));
          if (candidateSet.has(txMerchantNorm)) {
            // Found merchant as a close fuzzy candidate
            merchantScore = 90;
          }
        }

        // fallback to Levenshtein similarity
        if (merchantScore === 0) {
          const lev = levenshtein(txMerchantNorm, userMerchant);
          const maxLen = Math.max(txMerchantNorm.length, userMerchant.length) || 1;
          const similarity = 1 - (lev / maxLen);
          if (similarity >= 0.85) merchantScore = 80;
          else if (similarity >= 0.7) merchantScore = 60;
          else if (similarity >= 0.5) merchantScore = 40;
          else merchantScore = 0;
        }
      }
    }

    // recency score (days)
    const txDate = new Date(t.datetime || `${t.date}T${t.time || '00:00:00'}`);
    const days = Math.max(0, Math.floor((now - txDate) / (1000 * 60 * 60 * 24)));
    const recencyScore = Math.max(10, 100 - days);

    // weighted total (merchant prioritized slightly)
    const total = amountScore * 0.55 + merchantScore * 0.35 + recencyScore * 0.1;

    // push candidate for later tie-resolution / LLM fallback
    candidates.push({ transaction: t, score: total, amountScore, merchantScore, recencyScore, diffPct });

    if (!best || total > best.score) {
      secondBest = best;
      best = {
        transaction: t,
        score: total,
        amountScore,
        merchantScore,
        recencyScore,
        diffPct,
      };
    }
  }

  if (!best) {
    return {
      matched: false,
      transaction_id: null,
      confidence: 0,
      needs_correction: false,
      correction_prompt: null,
      skeptical_message: "I couldn't find a matching transaction — I'm a bit confused. Could you try again or type it?",
      reason: 'No candidate within amount tolerance'
    };
  }

  const tx = best.transaction;
  const confidence = Math.min(100, Math.round(best.score));

  // Decide whether to prompt correction — only treat as exact when merchant text exactly matches
  const txMerchantNorm = normalizeMerchant(tx.merchant || tx.description || '');
  const amountExact = best.diffPct <= 1; // within 1%
  // Exact only when normalized merchant exactly equals the user-said merchant
  const merchantExact = txMerchantNorm === userMerchant;

  // If both merchant and amount are exact, auto-accept. Otherwise we consider this a "close"
  // match and prompt the user to confirm before adding.
  const needs_correction = !(amountExact && merchantExact);
  const correction_prompt = needs_correction ? `Did you mean ${tx.merchant} ($${Number(tx.amount).toFixed(2)}) on ${tx.date || 'that date'}?` : null;

  // LLM fallback: use AI to handle complex/ambiguous cases with strict merchant matching
  try {
    const secondScore = secondBest ? secondBest.score : 0;
    const margin = best.score - secondScore;
    const llmThreshold = 15;
    const lowConfidenceThreshold = 70;

    const shouldCallLLM = anthropicClient && (confidence < lowConfidenceThreshold || margin < llmThreshold);

    if (shouldCallLLM) {
      const top = candidates.sort((a, b) => b.score - a.score).slice(0, 4);
      const candStr = top.map((c, i) => `\n${i + 1}. ID: ${c.transaction.transaction_id || c.transaction.id || 'N/A'} | Merchant: ${c.transaction.merchant} | Amount: $${c.transaction.amount} | Date: ${c.transaction.date} | Score: ${c.score.toFixed(1)}`).join('');

      const llmPrompt = `You are a transaction matcher. STRICT RULES:
1. If user said merchant X but transaction is merchant Y (different names), you MUST set needs_correction=true
2. If amount differs by more than 1%, you MUST set needs_correction=true
3. Only auto-match (needs_correction=false) if BOTH merchant name matches AND amount is within 1%

User said: "${userMerchantRaw}" for $${userAmount}
Candidates:${candStr}

Return ONLY JSON:
{
  "matched": true/false,
  "transaction_id": "...",
  "confidence": 0-100,
  "needs_correction": true/false (TRUE if merchant names differ OR amount differs >1%),
  "correction_prompt": "Did you mean [merchant] ($[amount]) on [date]?" (if needs_correction),
  "reason": "brief explanation"
}`;

      const response = await anthropicClient.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [{ role: 'user', content: llmPrompt }],
      });

      let text = response.content?.[0]?.text;
      if (text) {
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        try {
          const llmResult = JSON.parse(text);
          if (llmResult && typeof llmResult.matched !== 'undefined') {
            if (llmResult.matched && llmResult.transaction_id) {
              const chosen = top.find(c => (c.transaction.transaction_id || c.transaction.id) === llmResult.transaction_id);
              llmResult.transaction = chosen ? chosen.transaction : txnList.find(t => (t.transaction_id || t.id) === llmResult.transaction_id) || null;
            }
            llmResult.skeptical_message = null;
            return llmResult;
          }
        } catch (err) {
          console.warn('LLM parse error:', err?.message);
        }
      }
    }
  } catch (err) {
    console.warn('LLM fallback failed:', err?.message || err);
  }

  // Deterministic fallback
  return {
    matched: true,
    transaction_id: tx.transaction_id || tx.id || null,
    confidence,
    needs_correction,
    correction_prompt,
    skeptical_message: null,
    reason: `Picked ${tx.merchant} - amount diff ${best.diffPct.toFixed(2)}%, merchant score ${best.merchantScore}, total ${best.score.toFixed(1)}`,
    transaction: tx
  };

}

/*// TEST EXAMPLES
async function test() {
  const transactions = [
    { 
      transaction_id: "TXN001", 
      amount: 70.04, 
      merchant: "Whole Foods", 
      category: "groceries",
      date: "2025-02-01",
      time: "06:59:00",
      datetime: "2025-02-01T06:59:00",
      description: "WHOLE FOODS"
    },
    { 
      transaction_id: "TXN002", 
      amount: 47.23, 
      merchant: "Uber Eats", 
      category: "food_delivery",
      date: "2025-02-01",
      time: "20:34:00",
      datetime: "2025-02-01T20:34:00",
      description: "UBER EATS"
    }
  ];

  // TEST 1: User says wrong merchant (needs correction)
  console.log("\n=== TEST 1: Wrong Merchant ===");
  const result1 = await matchTransaction(
    { amount: "$75", merchant: "Target", category: "groceries" },
    "Spent 75 dollars at Target",
    "2025-02-01T07:00:00",
    transactions
  );
  console.log(JSON.stringify(result1, null, 2));

  // TEST 2: User says approximate amount (should accept)
  console.log("\n=== TEST 2: Approximate Amount ===");
  const result2 = await matchTransaction(
    { amount: "$47", merchant: "Uber Eats", category: "food_delivery" },
    "Ordered Uber Eats for about 47 bucks",
    "2025-02-01T20:45:00",
    transactions
  );
  console.log(JSON.stringify(result2, null, 2));

  // TEST 3: User claims spending that doesn't exist
  console.log("\n=== TEST 3: Non-existent Transaction ===");
  const result3 = await matchTransaction(
    { amount: "$200", merchant: "Nike", category: "shopping" },
    "Just bought shoes at Nike for 200",
    "2025-02-01T15:00:00",
    transactions
  );
  console.log(JSON.stringify(result3, null, 2));
}

// Uncomment to test: test();
*/
export { matchTransaction };