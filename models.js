import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  name: String,
  password_hash: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const emotionalTransactionSchema = new mongoose.Schema({
  user_id: {
    type: String, // Changed from ObjectId to String for demo
    required: true,
    default: 'default',
  },
  // Transaction matching info
  transaction_id: String, // From bank data
  matched_transaction: {
    type: Object, // Full bank transaction object
  },
  match_confidence: Number,
  needs_correction: Boolean,
  user_confirmed: Boolean,
  
  // Parsed spending info
  amount: {
    type: Number,
    required: true,
  },
  merchant: {
    type: String,
    required: true,
  },
  category: String,
  
  // Emotional context
  // raw_emotion stores the parser's original string; emotion stores the canonical enum
  raw_emotion: String,
  emotion: {
    type: String,
    enum: ['stressed', 'tired', 'deserved', 'guilt', 'regret', 'happy', 'anxious', 'neutral', 'peer_pressure', 'bored', 'lonely', 'excited', 'sad'],
    required: true,
  },
  context: String, // What the user said
  transcript: String, // Original voice transcript
  
  // Metadata
  entry_time: {
    type: Date,
    default: Date.now,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const goalSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    default: 'default',
  },
  title: {
    type: String,
    required: true,
  },
  target_amount: {
    type: Number,
    required: true,
  },
  current_amount: {
    type: Number,
    default: 0,
  },
  deadline: {
    type: Date,
  },
  description: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const guardrailSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    default: 'default',
  },
  trigger_phrase: String,
  spending_limit: Number,
  category: String,
  notification_enabled: {
    type: Boolean,
    default: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model('User', userSchema);
export const EmotionalTransaction = mongoose.model('EmotionalTransaction', emotionalTransactionSchema);
export const Goal = mongoose.model('Goal', goalSchema);
export const Guardrail = mongoose.model('Guardrail', guardrailSchema);
