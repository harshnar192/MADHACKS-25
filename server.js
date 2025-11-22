const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { parseEntry } = require("./parseEntryModule");
const { generateSummary } = require("./generateSummaryModule");

const app = express();
app.use(cors());
app.use(express.json());

// React calls this with transcript
app.post("/parse-entry", async (req, res) => {
  try {
    const { transcript } = req.body;
    const result = await parseEntry(transcript);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TTS person calls this to get summary
app.post("/generate-summary", async (req, res) => {
  try {
    const { persona, data } = req.body;
    const summary = await generateSummary(persona, data);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`LLM Service running at http://localhost:${PORT}`);
});