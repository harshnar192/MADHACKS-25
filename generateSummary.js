import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
dotenv.config();

const client = new Anthropic();

const PERSONAS = {
  supportive_friend: `Warm and encouraging. Celebrate wins, give gentle nudges. 
    Use casual language like "Hey!" and "You've got this." 
    Acknowledge struggles with empathy.`,

  stern_coach: `Direct and blunt. No sugarcoating. Call out problems clearly.
    Push for accountability. Use phrases like "Let's be real" and "No excuses."
    Focus on patterns and what needs to change.`,

  neutral_advisor: `Calm and factual. Data-driven analysis. No emotional language.
    Present numbers and percentages. Give objective recommendations.
    Use phrases like "Analysis indicates" and "Recommendation."`
};

const SUMMARY_PROMPT = `You are a financial coach creating a weekly voice summary.

PERSONA STYLE:
{PERSONA_STYLE}

USER'S GOALS:
{GOALS}

THIS WEEK'S SPENDING:
Total: {TOTAL}
By category: {BY_CATEGORY}

GOAL PROGRESS:
{GOAL_PROGRESS}

VOICE ENTRIES (what user logged with emotions):
{VOICE_ENTRIES}

INVISIBLE SPENDING (transactions user never logged):
{INVISIBLE_SPENDING}

EMOTIONAL PATTERNS DETECTED:
{PATTERNS}

Generate a spoken summary (5-7 sentences) that:
0. Each sentence should start with "{(emotion)} + sentence" where emotion = {happy, sad, angry, excited, calm, nervous, confident, surprised, satisfied, delighted, scared, worried, upset, frustrated, depressed, empathetic, embarrassed, disgusted, moved, proud, relaxed, grateful, curious, sarcastic} 
1. States total spending and goal progress
2. Highlights the most important emotional pattern
3. Calls out invisible spending if significant
4. Gives ONE specific actionable suggestion
5. Ends with appropriate tone for the persona

Keep it conversational — this will be spoken aloud via TTS.
No bullet points. No lists. Just natural speech.

Return ONLY the summary text, nothing else.`;

async function generateSummary(persona, data) {
  const { goals, spending, goalProgress, voiceEntries, invisibleSpending, patterns } = data;

  const goalsStr = goals.map(g => `- ${g.description}`).join("\n");
  
  const categoryStr = Object.entries(spending.by_category)
    .map(([cat, amt]) => `${cat}: $${amt}`)
    .join(", ");

  const progressStr = Object.entries(goalProgress)
    .map(([cat, p]) => `${cat}: $${p.actual} of $${p.goal} (${p.percent}%)`)
    .join("\n");

  const entriesStr = voiceEntries
    .map(e => `- "${e.raw_transcript}" [${e.parsed.emotion}]`)
    .join("\n");

  const invisibleStr = `${invisibleSpending.unlogged_transactions} transactions ($${invisibleSpending.unlogged_amount}) not logged`;

  const patternsStr = Object.entries(patterns)
    .map(([key, p]) => `- ${p.pattern} (${p.occurrences}x, $${p.total_cost})`)
    .join("\n");

  const prompt = SUMMARY_PROMPT
    .replace("{PERSONA_STYLE}", PERSONAS[persona])
    .replace("{GOALS}", goalsStr)
    .replace("{TOTAL}", spending.total_spent)
    .replace("{BY_CATEGORY}", categoryStr)
    .replace("{GOAL_PROGRESS}", progressStr)
    .replace("{VOICE_ENTRIES}", entriesStr)
    .replace("{INVISIBLE_SPENDING}", invisibleStr)
    .replace("{PATTERNS}", patternsStr);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content[0].text;
}

/*// TEST
async function test() {
  // Using mock data structure
  const data = {
    goals: [
      { description: "Keep food delivery under $75/week" },
      { description: "Limit bar spending to $100/week" },
      { description: "Coffee budget $25/week" }
    ],
    spending: {
      total_spent: 976.24,
      by_category: {
        food_delivery: 140.53,
        coffee: 22.50,
        alcohol: 225.00,
        shopping: 191.31,
        groceries: 87.42
      }
    },
    goalProgress: {
      food_delivery: { goal: 75, actual: 140.53, percent: 187 },
      alcohol: { goal: 100, actual: 225, percent: 225 },
      coffee: { goal: 25, actual: 22.50, percent: 90 }
    },
    voiceEntries: [
      { raw_transcript: "DoorDash again, fifty something. Super stressful day.", parsed: { emotion: "stressed" } },
      { raw_transcript: "Bar with coworkers, 85 bucks. Couldn't say no.", parsed: { emotion: "regret" } },
      { raw_transcript: "Third bar night this week. This is becoming a problem.", parsed: { emotion: "anxious" } }
    ],
    invisibleSpending: {
      unlogged_transactions: 14,
      unlogged_amount: 286.96
    },
    patterns: {
      stress_spending: { pattern: "Stress mentions followed by food delivery", occurrences: 3, total_cost: 140.53 },
      peer_pressure: { pattern: "Coworker mentions correlate with bar spending", occurrences: 2, total_cost: 147 }
    }
  };

  console.log("=== GENERATING SUMMARIES ===\n");

  for (const persona of ["stern_coach"]) {  // Just test one for speed
    console.log(`--- ${persona.toUpperCase()} ---\n`);
    const summary = await generateSummary(persona, data);
    console.log(summary);
    console.log("\n");
  }
}

test(); */

export { generateSummary };