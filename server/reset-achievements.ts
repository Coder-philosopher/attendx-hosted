import mongoose from 'mongoose';
import { defaultAchievements, AchievementModel } from './mongodb-achievements';

async function resetAchievements() {
  try {
    // Use the MongoDB URI from the environment variable
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI environment variable is not set');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Delete all achievements
    console.log('Deleting existing achievements...');
    await AchievementModel.deleteMany({});
    console.log('All achievements deleted');

    // Insert default achievements
    console.log('Creating default achievements...');
    await AchievementModel.insertMany(defaultAchievements);
    console.log(`Created ${defaultAchievements.length} default achievements`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    console.log('Achievement reset completed successfully!');
  } catch (error) {
    console.error('Error resetting achievements:', error);
  }
}

// Run the reset function
resetAchievements();