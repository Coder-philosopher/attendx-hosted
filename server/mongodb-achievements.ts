import mongoose from 'mongoose';
import { AchievementType, AchievementCategory, AchievementRequirementType, AchievementRarity } from '@shared/schema';

// Schema for achievements
const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: Object.values(AchievementType) 
  },
  category: { 
    type: String, 
    required: true, 
    enum: Object.values(AchievementCategory) 
  },
  badgeImageUrl: { type: String, required: true },
  points: { type: Number, required: true, default: 10 },
  rarity: { 
    type: String, 
    required: true, 
    enum: Object.values(AchievementRarity),
    default: AchievementRarity.COMMON 
  },
  requirementType: { 
    type: String, 
    required: true, 
    enum: Object.values(AchievementRequirementType) 
  },
  requirementValue: { type: Number, required: true },
  requirementDetails: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Schema for user achievements (linking users to their achievements)
const userAchievementSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // wallet address
  achievementId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Achievement', 
    required: true 
  },
  earnedAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 0, required: true },
  completedAt: { type: Date, default: null },
  metadata: { type: String } // JSON string for achievement-specific data
});

// Schema for user statistics
const userStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // wallet address
  displayName: { type: String },
  totalPoints: { type: Number, default: 0, required: true },
  level: { type: Number, default: 1, required: true },
  eventsCreated: { type: Number, default: 0, required: true },
  eventsAttended: { type: Number, default: 0, required: true },
  tokensCollected: { type: Number, default: 0, required: true },
  achievementsEarned: { type: Number, default: 0, required: true },
  streakDays: { type: Number, default: 0, required: true },
  lastActive: { type: Date, default: Date.now },
  joinedAt: { type: Date, default: Date.now },
  profileImageUrl: { type: String }
});

// Create the models if they don't exist
export const AchievementModel = mongoose.models.Achievement || 
  mongoose.model('Achievement', achievementSchema);

export const UserAchievementModel = mongoose.models.UserAchievement || 
  mongoose.model('UserAchievement', userAchievementSchema);

export const UserStatsModel = mongoose.models.UserStats || 
  mongoose.model('UserStats', userStatsSchema);

// Default achievements to create when initializing the database
export const defaultAchievements = [
  // Creator achievements
  {
    title: "Event Organizer",
    description: "Create your first event",
    type: AchievementType.CREATOR,
    category: AchievementCategory.CREATION,
    badgeImageUrl: "/achievements/first-event.svg",
    points: 10,
    rarity: AchievementRarity.COMMON,
    requirementType: AchievementRequirementType.COUNT,
    requirementValue: 1
  },
  {
    title: "Community Builder",
    description: "Create 5 events",
    type: AchievementType.CREATOR,
    category: AchievementCategory.CREATION,
    badgeImageUrl: "/achievements/event-creator.svg",
    points: 25,
    rarity: AchievementRarity.UNCOMMON,
    requirementType: AchievementRequirementType.COUNT,
    requirementValue: 5
  },
  {
    title: "Event Master",
    description: "Create 20 events",
    type: AchievementType.CREATOR,
    category: AchievementCategory.CREATION,
    badgeImageUrl: "/achievements/event-master.svg",
    points: 50,
    rarity: AchievementRarity.RARE,
    requirementType: AchievementRequirementType.COUNT,
    requirementValue: 20
  },
  {
    title: "Consistent Creator",
    description: "Create events for 3 consecutive weeks",
    type: AchievementType.CREATOR,
    category: AchievementCategory.CREATION,
    badgeImageUrl: "/achievements/event-streak.svg",
    points: 30,
    rarity: AchievementRarity.RARE,
    requirementType: AchievementRequirementType.STREAK,
    requirementValue: 21
  },
  {
    title: "Crowd Magnet",
    description: "Have 50 total token claims across all your events",
    type: AchievementType.CREATOR,
    category: AchievementCategory.SOCIAL,
    badgeImageUrl: "/achievements/crowd-magnet.svg",
    points: 40,
    rarity: AchievementRarity.RARE,
    requirementType: AchievementRequirementType.COUNT,
    requirementValue: 50
  },
  
  // Participant achievements
  {
    title: "First Attendance",
    description: "Claim your first event token",
    type: AchievementType.PARTICIPANT,
    category: AchievementCategory.ATTENDANCE,
    badgeImageUrl: "/achievements/first-attendance.svg",
    points: 5,
    rarity: AchievementRarity.COMMON,
    requirementType: AchievementRequirementType.COUNT,
    requirementValue: 1
  },
  {
    title: "Regular Attendee",
    description: "Claim tokens from 5 different events",
    type: AchievementType.PARTICIPANT,
    category: AchievementCategory.ATTENDANCE,
    badgeImageUrl: "/achievements/regular-attendee.svg",
    points: 15,
    rarity: AchievementRarity.UNCOMMON,
    requirementType: AchievementRequirementType.COUNT,
    requirementValue: 5
  },
  {
    title: "Event Enthusiast",
    description: "Claim tokens from 20 different events",
    type: AchievementType.PARTICIPANT,
    category: AchievementCategory.ATTENDANCE,
    badgeImageUrl: "/achievements/event-enthusiast.svg",
    points: 35,
    rarity: AchievementRarity.RARE,
    requirementType: AchievementRequirementType.COUNT,
    requirementValue: 20
  },
  {
    title: "Dedicated Participant",
    description: "Attend events for 3 consecutive weeks",
    type: AchievementType.PARTICIPANT,
    category: AchievementCategory.ATTENDANCE,
    badgeImageUrl: "/achievements/dedicated-participant.svg",
    points: 25,
    rarity: AchievementRarity.RARE,
    requirementType: AchievementRequirementType.STREAK,
    requirementValue: 21
  },
  {
    title: "Lightning Fast",
    description: "Claim a token within 1 hour of event creation",
    type: AchievementType.PARTICIPANT,
    category: AchievementCategory.SPECIAL,
    badgeImageUrl: "/achievements/lightning-fast.svg",
    points: 20,
    rarity: AchievementRarity.UNCOMMON,
    requirementType: AchievementRequirementType.SPECIAL,
    requirementValue: 1
  }
];

// Initialize the database with default achievements
export async function initializeAchievements() {
  try {
    // Check if achievements already exist
    const count = await AchievementModel.countDocuments();
    if (count === 0) {
      console.log('[achievements] No achievements found, creating defaults...');
      await AchievementModel.insertMany(defaultAchievements);
      console.log(`[achievements] Created ${defaultAchievements.length} default achievements`);
    } else {
      console.log(`[achievements] Found ${count} existing achievements, skipping initialization`);
    }
  } catch (error) {
    console.error('[achievements] Error initializing achievements:', error);
  }
}