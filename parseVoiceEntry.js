const Anthropic = require("@anthropic-ai/sdk").default;
require("dotenv").config();

const client = new Anthropic();

const PARSE_PROMPT = `You are a financial journal parser. Extract structured data from this voice transcript about spending.

Return ONLY valid JSON, no markdown, no code blocks, no explanation:
{
  "amount": number or null,
  "amount_confidence": "exact" | "estimated" | "unknown",
  "category": "food_delivery" | "coffee" | "alcohol" | "dining_out" | "groceries" | "shopping" | "transport" | "entertainment" | "subscriptions" | "bills" | "snacks" | "health" | "other",
  "emotion": "neutral" | "happy" | "regret" | "guilt" | "justified" | "impulsive" | "stressed" | "celebratory" | "self-critical" | "anxious" | "relieved" | "positive",
  "context": "brief note, 10 words max",
  "needs_followup": boolean
}

Transcript: "{TRANSCRIPT}"`;

async function parseEntry(transcript) {
  const prompt = PARSE_PROMPT.replace("{TRANSCRIPT}", transcript);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
  });

  let text = response.content[0].text;
  
  // Strip markdown code blocks if present
  text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  
  return JSON.parse(text);
}

// Test it
async function test() {
  const testCases = [
    "Just ordered Uber Eats again, like 47 bucks. Long day, feeling guilty.",
    "Spent way too much at Target but I needed everything",
    "Coffee, 6 dollars. My little treat before work, totally worth it.",
    "Went out with coworkers, probably dropped 80 at the bar. Couldn't say no.",
  ];

  for (const transcript of testCases) {
    console.log("\n--- INPUT:", transcript);
    const result = await parseEntry(transcript);
    console.log("OUTPUT:", JSON.stringify(result, null, 2));
  }
}

test();