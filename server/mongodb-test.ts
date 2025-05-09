import { EventModel, TokenClaimModel } from './mongodb';
import { log } from './vite';

/**
 * This utility function tests MongoDB connection and operations
 * It's used for verification purposes only
 */
export async function testMongoDB(): Promise<void> {
  try {
    log('Testing MongoDB connection...', 'mongodb-test');
    
    // Test basic operations
    const count = await EventModel.countDocuments();
    log(`Current event count in MongoDB: ${count}`, 'mongodb-test');
    
    // Test create sample event (commented out to avoid test data in production)
    /*
    const testEvent = new EventModel({
      name: 'Test Event',
      description: 'This is a test event',
      date: new Date(),
      creator: 'test-creator-wallet-address',
      tokenMintAddress: 'test-token-mint-address',
      qrCodeData: 'test-qr-code-data'
    });
    
    await testEvent.save();
    log('Test event saved to MongoDB', 'mongodb-test');
    */
    
    log('MongoDB test completed successfully', 'mongodb-test');
  } catch (error) {
    log(`MongoDB test failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'mongodb-test');
    throw error;
  }
}