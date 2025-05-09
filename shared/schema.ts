import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the Event table schema
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  creator: text("creator").notNull(), // Wallet address of creator
  tokenMintAddress: text("token_mint_address").notNull(), // Solana compressed token address
  qrCodeData: text("qr_code_data").notNull(), // Data for QR code
  maxAttendees: integer("max_attendees"), // Optional limit
  imageUrl: text("image_url"), // Optional image URL
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define the TokenClaim table schema for tracking claimed tokens
export const tokenClaims = pgTable("token_claims", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  walletAddress: text("wallet_address").notNull(), // Attendee wallet address
  transactionSignature: text("transaction_signature").notNull(), // Solana transaction signature
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
});

// Achievement Definitions - system-wide achievement templates
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'creator' or 'participant'
  category: text("category").notNull(), // 'attendance', 'creation', 'social', etc.
  badgeImageUrl: text("badge_image_url").notNull(),
  points: integer("points").notNull().default(10),
  rarity: text("rarity").notNull().default('common'), // common, rare, epic, legendary
  requirementType: text("requirement_type").notNull(), // count, streak, special, etc.
  requirementValue: integer("requirement_value").notNull(), // threshold to achieve
  requirementDetails: text("requirement_details"), // Additional JSON data for complex requirements
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Achievements - links users to achievements they've earned
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Wallet address
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  progress: integer("progress").notNull().default(0), // For partially completed achievements
  completedAt: timestamp("completed_at"), // Null if not yet completed
  metadata: text("metadata"), // Optional JSON string with achievement-specific data
});

// User Stats - tracks progress and points for each user
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(), // Wallet address
  displayName: text("display_name"), // Optional custom display name
  totalPoints: integer("total_points").notNull().default(0),
  level: integer("level").notNull().default(1),
  eventsCreated: integer("events_created").notNull().default(0),
  eventsAttended: integer("events_attended").notNull().default(0),
  tokensCollected: integer("tokens_collected").notNull().default(0),
  achievementsEarned: integer("achievements_earned").notNull().default(0),
  streakDays: integer("streak_days").notNull().default(0), // Consecutive days active
  lastActive: timestamp("last_active").defaultNow().notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  profileImageUrl: text("profile_image_url"),
});

// Create insert schemas for validation
export const insertEventSchema = createInsertSchema(events)
  .omit({ id: true, createdAt: true })
  .extend({
    // Handle date properly for JSON serialization
    date: z.string().transform((dateString) => new Date(dateString))
  });

export const insertTokenClaimSchema = createInsertSchema(tokenClaims)
  .omit({ id: true, claimedAt: true })
  .extend({
    // Allow eventId to be either a number or a string for MongoDB compatibility
    eventId: z.union([z.number(), z.string()]),
  });

export const insertAchievementSchema = createInsertSchema(achievements)
  .omit({ id: true, createdAt: true });

export const insertUserAchievementSchema = createInsertSchema(userAchievements)
  .omit({ id: true, earnedAt: true, completedAt: true });

export const insertUserStatsSchema = createInsertSchema(userStats)
  .omit({ id: true, lastActive: true, joinedAt: true });

// Export types
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type TokenClaim = typeof tokenClaims.$inferSelect;
export type InsertTokenClaim = z.infer<typeof insertTokenClaimSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;

// Achievement types and enumerations
export enum AchievementType {
  CREATOR = 'creator',
  PARTICIPANT = 'participant'
}

export enum AchievementCategory {
  ATTENDANCE = 'attendance',
  CREATION = 'creation',
  SOCIAL = 'social',
  COLLECTION = 'collection',
  SPECIAL = 'special'
}

export enum AchievementRequirementType {
  COUNT = 'count',         // Simple counting (e.g., attend 5 events)
  STREAK = 'streak',       // Consecutive actions (e.g., attend events 3 days in a row)
  TIME_LIMITED = 'time',   // Time-limited achievements (e.g., within a week)
  SPECIAL = 'special'      // Special/custom requirements
}

export enum AchievementRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}
