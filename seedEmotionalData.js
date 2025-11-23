import { readFileSync } from 'fs';
import { connectDB } from './db.js';
import { EmotionalTransaction } from './models.js';

async function seedEmotionalData() {
  try {
    console.log('🌱 Starting emotional transactions seed...');
    
    // Connect to MongoDB
    await connectDB();
    
    // Load impulsive transactions data
    const impulsiveData = JSON.parse(readFileSync('./files/impulsive.json', 'utf-8'));
    console.log(`📊 Found ${impulsiveData.transactions.length} transactions to seed`);
    
    // Clear existing data (optional - comment out if you want to keep existing)
    await EmotionalTransaction.deleteMany({});
    console.log('🗑️  Cleared existing emotional transactions');
    
    // Transform and insert transactions
    const emotionalTransactions = impulsiveData.transactions.map(tx => ({
      user_id: 'default',
      transaction_id: tx.transaction_id,
      matched_transaction: tx,
      match_confidence: 100,
      needs_correction: false,
      user_confirmed: true,
      amount: tx.amount,
      merchant: tx.merchant,
      category: tx.category,
      emotion: tx.mood || 'neutral', // Use mood from file
      raw_emotion: tx.mood || 'neutral',
      context: tx.description || `${tx.merchant} purchase`,
      transcript: `Spent $${tx.amount} at ${tx.merchant}`,
      entry_time: new Date(tx.datetime || `${tx.date}T${tx.time || '00:00:00'}`),
    }));
    
    // Insert all transactions
    const result = await EmotionalTransaction.insertMany(emotionalTransactions);
    console.log(`✅ Successfully seeded ${result.length} emotional transactions!`);
    
    // Show breakdown by emotion
    const emotionBreakdown = {};
    result.forEach(tx => {
      emotionBreakdown[tx.emotion] = (emotionBreakdown[tx.emotion] || 0) + 1;
    });
    console.log('\n📈 Emotion breakdown:');
    Object.entries(emotionBreakdown).forEach(([emotion, count]) => {
      console.log(`   ${emotion}: ${count} transactions`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedEmotionalData();
