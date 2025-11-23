import express from "express";
import cors from "cors";
import multer from "multer";
import { FishAudioClient } from "fish-audio";
import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { readFileSync, writeFileSync, existsSync } from "fs";
dotenv.config();

import { parseEntry } from "./parseVoiceEntry.js";
import { generateSummary } from "./generateSummary.js";
import { matchTransaction } from "./matchTransaction.js";
import { connectDB } from "./db.js";
import { EmotionalTransaction, Goal, Guardrail } from "./models.js";
import Anthropic from '@anthropic-ai/sdk';

const anthropicClient = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

const fishAudio = new FishAudioClient({ apiKey: process.env.FISH_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

const app = express();

// Connect to MongoDB
await connectDB();

// JWT Secret (in production, use a strong secret from env)
const JWT_SECRET = process.env.JWT_SECRET || 'madhacks-secret-key-change-in-production';
const JWT_EXPIRY = '7d'; // Token expires in 7 days

// Simple in-memory user storage (in production, use a database)
const USERS_FILE = './files/users.json';

// Load users from file or create empty array
function loadUsers() {
  if (existsSync(USERS_FILE)) {
    try {
      return JSON.parse(readFileSync(USERS_FILE, 'utf-8'));
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }
  return [];
}

// Save users to file
function saveUsers(users) {
  try {
    writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

// Initialize users file if it doesn't exist
if (!existsSync(USERS_FILE)) {
  saveUsers([]);
}

let users = loadUsers();

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

// JWT Verification Middleware
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

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

// Match transaction endpoint
app.post("/match-transaction", async (req, res) => {
  try {
    const { parsedEntry, transcript, entryTime } = req.body;
    
    if (!parsedEntry || !transcript) {
      return res.status(400).json({ 
        error: "Invalid request: 'parsedEntry' and 'transcript' are required" 
      });
    }

    // Load bank transactions from file
    const bankData = JSON.parse(readFileSync('./files/bank_transactions.json', 'utf-8'));
    const transactions = bankData.transactions || [];

    console.log(`🔍 Matching transaction: ${transcript.substring(0, 50)}...`);
    
    // Use current time if not provided
    const timeToMatch = entryTime || new Date().toISOString();
    
    // Smart fuzzy matching with corrections and skeptical messages
    const matchResult = await matchTransaction(parsedEntry, transcript, timeToMatch, transactions);
    console.log('Match result:', matchResult);
    
    res.json(matchResult);
  } catch (error) {
    console.error('Error matching transaction:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to match transaction. Please check API key and service availability.'
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

// Get bank transactions endpoint
app.get("/api/transactions", (req, res) => {
  try {
    const bankData = JSON.parse(readFileSync('./files/bank_transactions.json', 'utf-8'));
    res.json(bankData);
  } catch (error) {
    console.error('Error loading bank transactions:', error);
    res.status(500).json({ 
      error: 'Failed to load bank transactions',
      message: error.message 
    });
  }
});

// ==================== EMOTIONAL TRANSACTIONS ENDPOINTS ====================

// Save emotional transaction
app.post("/api/emotional-transactions", async (req, res) => {
  try {
    const {
      userId = 'default',
      transactionId,
      matchedTransaction,
      matchConfidence,
      needsCorrection,
      userConfirmed,
      amount,
      merchant,
      category,
      emotion,
      context,
      transcript,
    } = req.body;

    // Map parser emotion to canonical enum using Anthropic (LLM) when available
    let mappedEmotion = emotion;
    if (anthropicClient && emotion) {
      try {
        const prompt = `You are a concise mapper. Map the raw emotion token to one of these canonical labels exactly: ["stress","tired","deserved","guilt","regret","happy","anxious","neutral"].\nInput token: "${String(emotion)}"\nContext (transcript): "${String(transcript).slice(0,200)}"\nReturn ONLY JSON: {"emotion":"<one of the labels>","confidence":0-100,"reason":"short reason"}`;

        const resp = await anthropicClient.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 120,
          messages: [{ role: 'user', content: prompt }],
        });

        const text = resp.content && resp.content[0] && resp.content[0].text ? resp.content[0].text.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim() : null;
        if (text) {
          try {
            const parsed = JSON.parse(text);
            if (parsed && parsed.emotion && ['stress','tired','deserved','guilt','regret','happy','anxious','neutral'].includes(parsed.emotion)) {
              mappedEmotion = parsed.emotion;
            }
          } catch (e) {
            console.warn('Failed to parse emotion mapping from LLM:', e?.message || e);
          }
        }
      } catch (err) {
        console.warn('Emotion LLM mapping failed:', err?.message || err);
      }
    }

    const emotionalTransaction = new EmotionalTransaction({
      user_id: userId,
      transaction_id: transactionId,
      matched_transaction: matchedTransaction,
      match_confidence: matchConfidence,
      needs_correction: needsCorrection,
      user_confirmed: userConfirmed,
      amount,
      merchant,
      category,
      raw_emotion: emotion,
      emotion: mappedEmotion,
      context,
      transcript,
    });

    await emotionalTransaction.save();
    console.log(`✅ Saved emotional transaction: ${merchant} - $${amount} (${emotion})`);

    res.json({
      success: true,
      transaction: emotionalTransaction,
    });
  } catch (error) {
    console.error('Error saving emotional transaction:', error);
    res.status(500).json({
      error: error.message,
      details: 'Failed to save emotional transaction',
    });
  }
});

// Get emotional transactions for a user
app.get("/api/emotional-transactions", async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const limit = parseInt(req.query.limit) || 100;

    const transactions = await EmotionalTransaction
      .find({ user_id: userId })
      .sort({ entry_time: -1 })
      .limit(limit);

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error('Error fetching emotional transactions:', error);
    res.status(500).json({
      error: error.message,
      details: 'Failed to fetch emotional transactions',
    });
  }
});

// Get emotional spending breakdown (for pie chart)
app.get("/api/emotional-spending/breakdown", async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const timeframe = req.query.timeframe || 'month'; // day, week, month, all

    let dateFilter = {};
    if (timeframe !== 'all') {
      const now = new Date();
      if (timeframe === 'day') {
        dateFilter = { entry_time: { $gte: new Date(now.setHours(0, 0, 0, 0)) } };
      } else if (timeframe === 'week') {
        dateFilter = { entry_time: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
      } else if (timeframe === 'month') {
        dateFilter = { entry_time: { $gte: new Date(now.setDate(now.getDate() - 30)) } };
      }
    }

    const transactions = await EmotionalTransaction.find({
      user_id: userId,
      ...dateFilter,
    });

    // Calculate breakdown by emotion
    const emotionBreakdown = {};
    const emotionAmounts = {};
    let totalAmount = 0;

    transactions.forEach(t => {
      const emotion = t.emotion || 'neutral';
      emotionBreakdown[emotion] = (emotionBreakdown[emotion] || 0) + 1;
      emotionAmounts[emotion] = (emotionAmounts[emotion] || 0) + t.amount;
      totalAmount += t.amount;
    });

    const breakdown = Object.keys(emotionBreakdown).map(emotion => ({
      emotion,
      count: emotionBreakdown[emotion],
      amount: emotionAmounts[emotion],
      percentage: Math.round((emotionBreakdown[emotion] / transactions.length) * 100),
    }));

    res.json({
      success: true,
      totalAmount,
      totalCount: transactions.length,
      breakdown,
      timeframe,
    });
  } catch (error) {
    console.error('Error calculating emotional spending breakdown:', error);
    res.status(500).json({
      error: error.message,
      details: 'Failed to calculate breakdown',
    });
  }
});

// Confirm a transaction that needed correction
app.patch("/api/emotional-transactions/:id/confirm", async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmed, correctedMerchant } = req.body;

    const transaction = await EmotionalTransaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    transaction.user_confirmed = confirmed;
    if (correctedMerchant) {
      transaction.merchant = correctedMerchant;
    }
    await transaction.save();

    console.log(`✅ User ${confirmed ? 'confirmed' : 'denied'} transaction ${id}`);

    res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error('Error confirming transaction:', error);
    res.status(500).json({
      error: error.message,
    });
  }
});

// Authentication endpoints
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: "Email, password, and name are required" 
      });
    }

    // Check if user already exists
    users = loadUsers();
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        error: "User with this email already exists" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'Failed to create account',
      message: error.message 
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: "Email and password are required" 
      });
    }

    // Find user
    users = loadUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ 
        error: "Invalid email or password" 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: "Invalid email or password" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Failed to login',
      message: error.message 
    });
  }
});

app.get("/api/auth/verify", verifyToken, (req, res) => {
  // If we get here, token is valid
  users = loadUsers();
  const user = users.find(u => u.id === req.user.userId);
  
  if (!user) {
    return res.status(404).json({ 
      error: "User not found" 
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
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
    availableEndpoints: ['/health', '/api/auth/login', '/api/auth/signup', '/api/auth/verify', '/api/transactions', '/api/impulsive', '/api/monthly', '/parse-entry', '/match-transaction', '/generate-summary', '/api/transcribe']
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
  console.log(`   - GET  /api/transactions`);
  console.log(`   - POST /api/transcribe`);
  console.log(`   - POST /parse-entry`);
  console.log(`   - POST /match-transaction`);
  console.log(`   - POST /generate-summary\n`);
});