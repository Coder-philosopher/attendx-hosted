import mongoose from 'mongoose';
import { log } from './vite';
import 'dotenv/config';
// MongoDB URI from environment variable
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set. Please set it to connect to MongoDB.');
}

// Connect to MongoDB
export async function connectToMongoDB() {
  try {
    log('Connecting to MongoDB...', 'mongodb');
    await mongoose.connect(MONGODB_URI as string);
    log('Connected to MongoDB successfully!', 'mongodb');
    return mongoose.connection;
  } catch (error) {
    log(`Error connecting to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`, 'mongodb');
    throw error;
  }
}

// Define schemas
const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  creator: { type: String, required: true }, // Wallet address of creator
  tokenMintAddress: { type: String, required: true }, // Solana compressed token address
  qrCodeData: { type: String, required: true }, // Data for QR code
  maxAttendees: { type: Number }, // Optional limit
  imageUrl: { type: String }, // Optional image URL
  createdAt: { type: Date, default: Date.now }
});

const tokenClaimSchema = new mongoose.Schema({
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event',
    required: true 
  },
  walletAddress: { type: String, required: true }, // Attendee wallet address
  transactionSignature: { type: String, required: true }, // Solana transaction signature
  claimedAt: { type: Date, default: Date.now }
});

// Create models
export const EventModel = mongoose.models.Event || mongoose.model('Event', eventSchema);
export const TokenClaimModel = mongoose.models.TokenClaim || mongoose.model('TokenClaim', tokenClaimSchema);