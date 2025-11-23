import express from "express";
import cors from "cors";
import multer from "multer";
import { FishAudioClient } from "fish-audio";
import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";
import dotenv from "dotenv";
dotenv.config();

import { parseEntry } from "./parseVoiceEntry.js";
import { generateSummary } from "./generateSummary.js";

const fishAudio = new FishAudioClient({ apiKey: process.env.FISH_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

const app = express();

// Enhanced CORS configuration to allow frontend on port 5173 (Vite default)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // Increase limit for audio data if needed

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Helper function to convert webm to mp3
function webmToMp3(buffer) {
  const ffmpeg = spawn(ffmpegPath, [
    "-i", "pipe:0",
    "-f", "mp3",
    "-acodec", "libmp3lame",
    "-b:a", "128k",
    "pipe:1"
  ]);

  ffmpeg.stdin.write(buffer);
  ffmpeg.stdin.end();

  return ffmpeg.stdout; // readable stream of MP3 data
}

// Audio transcription endpoint (Speech-to-Text)
app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: "No audio file provided" 
      });
    }

    console.log('🎧 Received audio:', req.file.size, 'bytes');
    console.log('🔄 Converting webm to mp3...');
    
    const mp3Stream = webmToMp3(req.file.buffer);

    console.log('🤖 Transcribing with Fish Audio...');
    const response = await fishAudio.speechToText.convert({ 
      audio: mp3Stream
    });
    
    console.log('✅ Transcription:', response.text);

    res.json({
      success: true,
      text: response.text,
      duration: req.body.duration || null
    });
  } catch (error) {
    console.error('❌ Transcription error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to transcribe audio. Check Fish API key and ffmpeg installation.'
    });
  }
});

// Parse voice entry endpoint
app.post("/parse-entry", async (req, res) => {
  try {
    const { transcript } = req.body;
    
    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ 
        error: "Invalid request: 'transcript' is required and must be a string" 
      });
    }

    console.log('Parsing transcript:', transcript.substring(0, 50) + '...');
    const result = await parseEntry(transcript);
    console.log('Parse result:', result);
    
    res.json(result);
  } catch (error) {
    console.error('Error parsing entry:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to parse voice entry. Please check API key and service availability.'
    });
  }
});

// Generate summary endpoint
app.post("/generate-summary", async (req, res) => {
  try {
    const { persona, data } = req.body;
    
    if (!persona || !data) {
      return res.status(400).json({ 
        error: "Invalid request: both 'persona' and 'data' are required" 
      });
    }

    const validPersonas = ['supportive_friend', 'stern_coach', 'neutral_advisor'];
    if (!validPersonas.includes(persona)) {
      return res.status(400).json({ 
        error: `Invalid persona. Must be one of: ${validPersonas.join(', ')}` 
      });
    }

    console.log(`Generating summary with persona: ${persona}`);
    const summary = await generateSummary(persona, data);
    console.log('Generated summary length:', summary.length);
    
    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to generate summary. Please check API key and service availability.'
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "MadHacks AI Backend"
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: ['/health', '/parse-entry', '/generate-summary']
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 MadHacks AI Backend Service running at http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   - GET  /health`);
  console.log(`   - POST /parse-entry`);
  console.log(`   - POST /generate-summary\n`);
});