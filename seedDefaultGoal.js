import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Goal } from './models.js';

dotenv.config();

async function seedDefaultGoal() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing goals for fresh start
    await Goal.deleteMany({ user_id: 'default' });
    console.log('🗑️  Cleared existing goals');

    // Create default savings goal - Save for a car
    const carGoal = new Goal({
      user_id: 'default',
      title: 'Save for a Car',
      target_amount: 5000,
      current_amount: 0,
      deadline: new Date('2026-06-30'), // June 30, 2026
      description: 'Saving $5000 for a down payment on a car by June 2026',
    });

    await carGoal.save();
    console.log('✅ Created savings goal: Save $5000 for a car by June 2026');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding default goal:', error);
    process.exit(1);
  }
}

seedDefaultGoal();
