import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
dotenv.config();

const client = new Anthropic();

const MATCH_PROMPT = `You are matching a voice journal entry to bank transactions.

Voice Entry:
- Transcript: "{TRANSCRIPT}"
- Parsed amount: {AMOUNT}
- Parsed category: {CATEGORY}
- Entry time: {ENTRY_TIME}

Recent Bank Transactions:
{TRANSACTIONS}

Find the best matching transaction. Consider:
1. Amount similarity (user estimates may be off by 10-20%)
2. Category match
3. Time proximity (voice entry usually comes within hours of purchase)

Return ONLY valid JSON, no markdown, no code blocks:
{
  "matched_transaction_id": "tx_xxx" or null,
  "confidence": "high" | "medium" | "low" | "none",
  "reason": "brief explanation"
}`;

async function matchTransaction(parsedEntry, transcript, entryTime, transactions) {
  const transactionsStr = transactions
    .map(t => `- ${t.id}: $${t.amount} at ${t.merchant} (${t.category}) on ${t.date}`)
    .join("\n");

  const prompt = MATCH_PROMPT
    .replace("{TRANSCRIPT}", transcript)
    .replace("{AMOUNT}", parsedEntry.amount || "unknown")
    .replace("{CATEGORY}", parsedEntry.category)
    .replace("{ENTRY_TIME}", entryTime)
    .replace("{TRANSACTIONS}", transactionsStr);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
  });

  let text = response.content[0].text;
  text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  
  return JSON.parse(text);
}

/*// TEST
async function test() {
  // Sample bank transactions (from mock data)
  const transactions = [
    { id: "tx_001", amount: 47.23, merchant: "Uber Eats", category: "food_delivery", date: "2025-01-20T20:34:00" },
    { id: "tx_002", amount: 5.75, merchant: "Starbucks", category: "coffee", date: "2025-01-20T08:12:00" },
    { id: "tx_006", amount: 85.00, merchant: "The Tipsy Crow Bar", category: "alcohol", date: "2025-01-21T22:15:00" },
  ];

  // User said this
  const transcript = "Just ordered Uber Eats again, like 47 bucks. Long day, feeling guilty.";
  
  // We already parsed it
  const parsedEntry = {
    amount: 47,
    category: "food_delivery",
    emotion: "guilt"
  };

  console.log("--- MATCHING TEST ---");
  console.log("Transcript:", transcript);
  console.log("Looking for match in", transactions.length, "transactions...\n");

  const result = await matchTransaction(parsedEntry, transcript, "2025-01-20T20:45:00", transactions);
  console.log("Result:", JSON.stringify(result, null, 2));
}

test(); */
export { matchTransaction };