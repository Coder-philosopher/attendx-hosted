import { apiRequest } from "./queryClient";
import { InsertEvent, Event, TokenClaim } from "@shared/schema";
import { mintCompressedToken, createSolanaPayUrl, generateEventUniqueId } from "./solana";

// Create a new event and mint its token
export async function createEvent(
  eventData: Omit<InsertEvent, "tokenMintAddress" | "qrCodeData" | "creator">,
  creatorWallet: string
): Promise<Event> {
  try {
    // Step 1: Mint the compressed token on Solana
    // Ensure we have a Date object for mintCompressedToken
    const eventDate = eventData.date instanceof Date 
      ? eventData.date 
      : new Date(eventData.date);
    
    const { tokenMintAddress, transactionSignature } = await mintCompressedToken(
      eventData.name,
      eventData.description,
      eventDate,
      creatorWallet,
      eventData.imageUrl || undefined
    );

    // Step 2: Generate unique QR code data
    const qrCodeData = generateEventUniqueId();
    
    // Step 3: Save the event to our backend
    const completedEventData: InsertEvent = {
      ...eventData,
      creator: creatorWallet,
      tokenMintAddress,
      qrCodeData
    };

    const response = await apiRequest('POST', '/api/events', completedEventData);
    return await response.json();
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
}

// Get all events
export async function getEvents(): Promise<Event[]> {
  try {
    const response = await apiRequest('GET', '/api/events');
    return await response.json();
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
}

// Get a specific event by ID
export async function getEvent(eventId: number | string): Promise<Event> {
  try {
    const response = await apiRequest('GET', `/api/events/${eventId}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    throw error;
  }
}

// Get events created by a specific wallet
export async function getEventsByCreator(creatorAddress: string): Promise<Event[]> {
  try {
    const response = await apiRequest('GET', `/api/creators/${creatorAddress}/events`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching events for creator ${creatorAddress}:`, error);
    throw error;
  }
}

// Claim a token for an event
export async function claimToken(
  eventId: number | string,
  tokenMintAddress: string,
  walletAddress: string,
  transactionSignature: string
): Promise<TokenClaim> {
  try {
    // Ensure eventId is properly formatted as a string for MongoDB
    const claimData = {
      eventId: eventId.toString(),
      walletAddress,
      transactionSignature
    };

    console.log('Claiming token with data:', claimData);
    const response = await apiRequest('POST', '/api/claims', claimData);
    return await response.json();
  } catch (error) {
    console.error(`Error claiming token for event ${eventId}:`, error);
    throw error;
  }
}

// Get all tokens claimed by a wallet
export async function getTokensByWallet(walletAddress: string): Promise<(TokenClaim & { event: Event })[]> {
  try {
    const response = await apiRequest('GET', `/api/wallets/${walletAddress}/claims`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching tokens for wallet ${walletAddress}:`, error);
    throw error;
  }
}

// Check if a wallet has already claimed a token for an event
export async function hasWalletClaimedToken(eventId: number | string, walletAddress: string): Promise<boolean> {
  try {
    const response = await apiRequest('GET', `/api/events/${eventId}/claims/${walletAddress}`);
    const data = await response.json();
    return data.hasClaimed;
  } catch (error) {
    console.error(`Error checking if wallet ${walletAddress} has claimed token for event ${eventId}:`, error);
    throw error;
  }
}

// Generate claim URL for an event
export function generateClaimUrl(eventId: number | string): string {
  const baseUrl = window.location.origin;
  return createSolanaPayUrl(eventId, baseUrl);
}

// Achievement API functions
export async function getUserAchievements(walletAddress: string): Promise<any> {
  try {
    const response = await apiRequest('GET', `/api/users/${walletAddress}/achievements`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching achievements for user ${walletAddress}:`, error);
    throw error;
  }
}

export async function getUserStats(walletAddress: string): Promise<any> {
  try {
    const response = await apiRequest('GET', `/api/users/${walletAddress}/stats`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching stats for user ${walletAddress}:`, error);
    throw error;
  }
}

export async function getAllAchievements(): Promise<any> {
  try {
    const response = await apiRequest('GET', '/api/achievements');
    return await response.json();
  } catch (error) {
    console.error("Error fetching all achievements:", error);
    throw error;
  }
}

// Manually trigger achievement check (for testing/development)
export async function checkAchievements(walletAddress: string, type: 'creator' | 'participant'): Promise<any> {
  try {
    const response = await apiRequest('POST', `/api/users/${walletAddress}/achievements/check`, { type });
    return await response.json();
  } catch (error) {
    console.error(`Error checking achievements for user ${walletAddress}:`, error);
    throw error;
  }
}
