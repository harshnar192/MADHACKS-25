import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/madhacks';

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    console.log('📊 Using existing MongoDB connection');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('✅ Connected to MongoDB:', MONGODB_URI.replace(/\/\/.*@/, '//***@')); // Hide credentials
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectDB() {
  if (!isConnected) return;
  
  await mongoose.disconnect();
  isConnected = false;
  console.log('🔌 Disconnected from MongoDB');
}
