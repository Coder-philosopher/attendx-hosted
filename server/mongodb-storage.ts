import { IStorage } from './storage';
import { Event, InsertEvent, TokenClaim, InsertTokenClaim } from '@shared/schema';
import { EventModel, TokenClaimModel } from './mongodb';
import mongoose from 'mongoose';
import { achievementService } from './achievement-service';

export class MongoDBStorage implements IStorage {
  // Event operations
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    // Make sure date is correctly parsed into a Date object
    const processedEvent = {
      ...insertEvent,
      date: insertEvent.date instanceof Date 
        ? insertEvent.date 
        : new Date(insertEvent.date)
    };
    
    const newEvent = new EventModel(processedEvent);
    const savedEvent = await newEvent.save();
    
    // Process achievements for event creation
    try {
      await achievementService.processEventCreation(insertEvent.creator);
    } catch (error) {
      console.warn('[mongodb-storage] Failed to process achievements for event creation:', error);
      // Don't fail the event creation if achievement processing fails
    }
    
    return this.mongoEventToEvent(savedEvent);
  }

  async getEvent(id: number | string): Promise<Event | undefined> {
    try {
      // Handle case when id is a number (from memory storage)
      // MongoDB ObjectIds are strings, but we need to be compatible with both
      
      // Check if the ID is a partial MongoDB ID (like just "681" instead of full ObjectId)
      // If it's a string less than 24 characters, try to match the beginning of ObjectIds
      if (typeof id === 'string' && id.length < 24 && /^[0-9a-f]+$/i.test(id)) {
        console.log(`Looking up event with partial ID: ${id}`);
        // Find all events and filter by ID prefix
        const events = await EventModel.find({});
        const matchingEvent = events.find(event => 
          event._id.toString().startsWith(id)
        );
        
        if (matchingEvent) {
          console.log(`Found event with matching ID prefix: ${matchingEvent._id}`);
          return this.mongoEventToEvent(matchingEvent);
        }
        
        return undefined;
      }
      
      // Normal lookup by exact ID
      const event = await EventModel.findById(id);
      return event ? this.mongoEventToEvent(event) : undefined;
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        console.log(`Cast error finding event with id ${id}`, error);
        return undefined;
      }
      console.error(`Error finding event with id ${id}:`, error);
      throw error;
    }
  }

  async getEventByMintAddress(tokenMintAddress: string): Promise<Event | undefined> {
    const event = await EventModel.findOne({ tokenMintAddress });
    return event ? this.mongoEventToEvent(event) : undefined;
  }

  async getEvents(): Promise<Event[]> {
    const events = await EventModel.find().sort({ createdAt: -1 });
    return events.map(event => this.mongoEventToEvent(event));
  }

  async getEventsByCreator(creatorAddress: string): Promise<Event[]> {
    const events = await EventModel.find({ creator: creatorAddress }).sort({ createdAt: -1 });
    return events.map(event => this.mongoEventToEvent(event));
  }

  // TokenClaim operations
  async createTokenClaim(insertTokenClaim: InsertTokenClaim): Promise<TokenClaim> {
    // First, ensure we get the actual event to use its proper MongoDB ObjectId
    console.log('[mongodb-storage] Processing token claim for eventId:', insertTokenClaim.eventId);
    
    // Try to find the event with the given ID (whether it's a string partial ID or numeric ID)
    const event = await this.getEvent(insertTokenClaim.eventId);
    if (!event) {
      console.error(`[mongodb-storage] Failed to find event with ID: ${insertTokenClaim.eventId}`);
      throw new Error(`Event with ID ${insertTokenClaim.eventId} not found`);
    }
    
    console.log('[mongodb-storage] Found event:', event.id, event.name);
    
    const newTokenClaim = new TokenClaimModel({
      ...insertTokenClaim,
      // Use the actual event ID we found
      eventId: event.id 
    });
    
    const savedTokenClaim = await newTokenClaim.save();
    console.log('[mongodb-storage] Token claim saved with ID:', savedTokenClaim._id.toString());
    
    // Process achievements for token claim
    try {
      await achievementService.processTokenClaim(
        insertTokenClaim.walletAddress, 
        event.id.toString()
      );
    } catch (error) {
      console.warn('[mongodb-storage] Failed to process achievements for token claim:', error);
      // Don't fail the token claim if achievement processing fails
    }
    
    return this.mongoTokenClaimToTokenClaim(savedTokenClaim);
  }

  async getTokenClaim(id: number | string): Promise<TokenClaim | undefined> {
    try {
      // Check if the ID is a partial MongoDB ID
      if (typeof id === 'string' && id.length < 24 && /^[0-9a-f]+$/i.test(id)) {
        console.log(`Looking up token claim with partial ID: ${id}`);
        // Find all token claims and filter by ID prefix
        const tokenClaims = await TokenClaimModel.find({});
        const matchingClaim = tokenClaims.find(claim => 
          claim._id.toString().startsWith(id)
        );
        
        if (matchingClaim) {
          console.log(`Found token claim with matching ID prefix: ${matchingClaim._id}`);
          return this.mongoTokenClaimToTokenClaim(matchingClaim);
        }
        
        return undefined;
      }
      
      // Normal lookup by exact ID
      const tokenClaim = await TokenClaimModel.findById(id);
      return tokenClaim ? this.mongoTokenClaimToTokenClaim(tokenClaim) : undefined;
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        console.log(`Cast error finding token claim with id ${id}`, error);
        return undefined;
      }
      console.error(`Error finding token claim with id ${id}:`, error);
      throw error;
    }
  }

  async getTokenClaimsByEvent(eventId: number | string): Promise<TokenClaim[]> {
    // If we have a partial MongoDB ID, try to find the full ID first
    if (typeof eventId === 'string' && eventId.length < 24 && /^[0-9a-f]+$/i.test(eventId)) {
      const event = await this.getEvent(eventId);
      if (event) {
        eventId = event.id;
      }
    }
    
    const tokenClaims = await TokenClaimModel.find({ eventId });
    return tokenClaims.map(claim => this.mongoTokenClaimToTokenClaim(claim));
  }

  async getTokenClaimsByWallet(walletAddress: string): Promise<TokenClaim[]> {
    const tokenClaims = await TokenClaimModel.find({ walletAddress });
    return tokenClaims.map(claim => this.mongoTokenClaimToTokenClaim(claim));
  }

  async hasWalletClaimedToken(eventId: number | string, walletAddress: string): Promise<boolean> {
    // If we have a partial MongoDB ID, try to find the full ID first
    if (typeof eventId === 'string' && eventId.length < 24 && /^[0-9a-f]+$/i.test(eventId)) {
      const event = await this.getEvent(eventId);
      if (event) {
        eventId = event.id;
      }
    }
  
    const count = await TokenClaimModel.countDocuments({ 
      eventId,
      walletAddress 
    });
    return count > 0;
  }

  // Helper methods to convert between MongoDB documents and our types
  private mongoEventToEvent(mongoEvent: any): Event {
    return {
      id: mongoEvent._id.toString(),
      name: mongoEvent.name,
      description: mongoEvent.description,
      date: new Date(mongoEvent.date),
      creator: mongoEvent.creator,
      tokenMintAddress: mongoEvent.tokenMintAddress,
      qrCodeData: mongoEvent.qrCodeData,
      maxAttendees: mongoEvent.maxAttendees ?? null,
      imageUrl: mongoEvent.imageUrl ?? null,
      createdAt: new Date(mongoEvent.createdAt)
    };
  }

  private mongoTokenClaimToTokenClaim(mongoTokenClaim: any): TokenClaim {
    return {
      id: mongoTokenClaim._id.toString(),
      eventId: mongoTokenClaim.eventId.toString(),
      walletAddress: mongoTokenClaim.walletAddress,
      transactionSignature: mongoTokenClaim.transactionSignature,
      claimedAt: new Date(mongoTokenClaim.claimedAt)
    };
  }
}