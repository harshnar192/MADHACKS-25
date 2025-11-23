const fs = require("fs");
const { parseEntry } = require("./parseEntry");
const { generateSummary } = require("./generateSummary");

// Load mock data
const mockData = JSON.parse(fs.readFileSync("all_mock_data.json", "utf-8"));

async function testParser() {
  console.log("=== TESTING ENTRY PARSER ===\n");
  
  const testTranscripts = [
    "Dropped 50 bucks on drinks last night, feeling rough about it",
    "Groceries, around 80 dollars, feeling responsible for once",
    "Uber to the airport, 45 dollars, necessary expense",
  ];

  for (const t of testTranscripts) {
    console.log("Input:", t);
    const result = await parseEntry(t);
    console.log("Output:", result, "\n");
  }
}

async function testSummary() {
  console.log("\n=== TESTING SUMMARY GENERATOR ===\n");

  const data = {
    goals: mockData.goals,
    spending: mockData.analysis.spending_summary,
    goalProgress: mockData.analysis.goal_progress,
    voiceEntries: mockData.voice_entries,
    invisibleSpending: mockData.analysis.invisible_spending,
    patterns: mockData.analysis.emotional_patterns,
  };

  for (const persona of ["supportive_friend", "stern_coach", "neutral_advisor"]) {
    console.log(`\n--- ${persona.toUpperCase()} ---`);
    const summary = await generateSummary(persona, data);
    console.log(summary);
  }
}

async function main() {
  await testParser();
  await testSummary();
}

main();