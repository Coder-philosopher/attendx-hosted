import { 
  AchievementModel, 
  UserAchievementModel, 
  UserStatsModel 
} from './mongodb-achievements';
import { EventModel, TokenClaimModel } from './mongodb';
import { 
  Achievement, 
  UserAchievement, 
  UserStats,
  AchievementType,
  AchievementRequirementType
} from '@shared/schema';
import mongoose from 'mongoose';

export class AchievementService {
  /**
   * Initialize user stats if they don't exist
   */
  async initUserStats(userId: string): Promise<UserStats> {
    const userStats = await UserStatsModel.findOne({ userId });
    
    if (!userStats) {
      console.log(`[achievements] Creating new user stats for ${userId}`);
      const newUserStats = new UserStatsModel({
        userId,
        lastActive: new Date()
      });
      return await newUserStats.save();
    }
    
    return userStats.toObject();
  }

  /**
   * Update stats when a user creates an event
   */
  async processEventCreation(userId: string): Promise<void> {
    // Initialize user stats if needed
    await this.initUserStats(userId);
    
    // Update stats
    const updatedStats = await UserStatsModel.findOneAndUpdate(
      { userId },
      { 
        $inc: { eventsCreated: 1 },
        $set: { lastActive: new Date() }
      },
      { new: true }
    );
    
    // Check for achievements related to event creation
    await this.checkForAchievements(userId, AchievementType.CREATOR);
  }

  /**
   * Update stats when a user claims a token
   */
  async processTokenClaim(userId: string, eventId: string): Promise<void> {
    // Initialize user stats if needed
    await this.initUserStats(userId);
    
    // Update stats
    const updatedStats = await UserStatsModel.findOneAndUpdate(
      { userId },
      { 
        $inc: { eventsAttended: 1, tokensCollected: 1 },
        $set: { lastActive: new Date() }
      },
      { new: true }
    );
    
    // Check for achievements related to token claims
    await this.checkForAchievements(userId, AchievementType.PARTICIPANT);
  }

  /**
   * Check if a user qualifies for any achievements
   */
  async checkForAchievements(userId: string, type: AchievementType): Promise<void> {
    // Get all achievements of the given type
    const achievements = await AchievementModel.find({ type });
    
    // Get user's current stats
    const userStats = await UserStatsModel.findOne({ userId });
    if (!userStats) return;
    
    // Get already earned achievements
    const earnedAchievementIds = (await UserAchievementModel.find({ 
      userId, 
      completedAt: { $ne: null } 
    })).map(ua => ua.achievementId.toString());
    
    // Process each achievement
    for (const achievement of achievements) {
      // Skip if already earned
      if (earnedAchievementIds.includes(achievement._id.toString())) continue;
      
      // Check if the user meets the requirements
      const isEarned = await this.checkAchievementRequirements(
        userId, 
        achievement, 
        userStats.toObject()
      );
      
      if (isEarned) {
        // Update user achievement record
        await this.awardAchievement(userId, achievement);
      }
    }
  }

  /**
   * Check if a user meets the requirements for an achievement
   */
  private async checkAchievementRequirements(
    userId: string, 
    achievement: any, 
    userStats: any
  ): Promise<boolean> {
    const { requirementType, requirementValue } = achievement;
    
    switch (requirementType) {
      case AchievementRequirementType.COUNT:
        return this.checkCountRequirement(userId, achievement, userStats);
        
      case AchievementRequirementType.STREAK:
        return this.checkStreakRequirement(userId, achievement, userStats);
        
      case AchievementRequirementType.TIME_LIMITED:
        return this.checkTimeLimitedRequirement(userId, achievement, userStats);
        
      case AchievementRequirementType.SPECIAL:
        return this.checkSpecialRequirement(userId, achievement, userStats);
        
      default:
        return false;
    }
  }

  /**
   * Check count-based requirements (e.g., "Create 5 events")
   */
  private async checkCountRequirement(
    userId: string, 
    achievement: any, 
    userStats: any
  ): Promise<boolean> {
    const { type, requirementValue, category } = achievement;
    
    // Check different metrics based on achievement type and category
    if (type === AchievementType.CREATOR) {
      return userStats.eventsCreated >= requirementValue;
    } else if (type === AchievementType.PARTICIPANT) {
      // For attendance, check unique events attended
      if (category === 'attendance') {
        const uniqueEventsAttended = await TokenClaimModel.distinct('eventId', { 
          walletAddress: userId 
        });
        return uniqueEventsAttended.length >= requirementValue;
      }
      
      return userStats.eventsAttended >= requirementValue;
    }
    
    return false;
  }

  /**
   * Check streak-based requirements (e.g., "Attend events 3 days in a row")
   */
  private async checkStreakRequirement(
    userId: string, 
    achievement: any, 
    userStats: any
  ): Promise<boolean> {
    const { requirementValue } = achievement;
    
    // For now, use the stored streak days value
    return userStats.streakDays >= requirementValue;
  }

  /**
   * Check time-limited requirements (e.g., "Within a week")
   */
  private async checkTimeLimitedRequirement(
    userId: string, 
    achievement: any, 
    userStats: any
  ): Promise<boolean> {
    // Implementation for time-limited achievements
    return false; // Placeholder
  }

  /**
   * Check special requirements (custom logic)
   */
  private async checkSpecialRequirement(
    userId: string, 
    achievement: any, 
    userStats: any
  ): Promise<boolean> {
    const { title } = achievement;
    
    // Special logic based on achievement title
    if (title === "Lightning Fast") {
      // Check if user claimed a token within 1 hour of event creation
      const claims = await TokenClaimModel.find({ walletAddress: userId });
      
      for (const claim of claims) {
        const event = await EventModel.findById(claim.eventId);
        if (!event) continue;
        
        const eventCreatedAt = new Date(event.createdAt);
        const claimCreatedAt = new Date(claim.claimedAt);
        
        // Check if claimed within an hour
        const timeDiffMs = claimCreatedAt.getTime() - eventCreatedAt.getTime();
        const hourInMs = 60 * 60 * 1000;
        
        if (timeDiffMs <= hourInMs) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Award an achievement to a user
   */
  private async awardAchievement(userId: string, achievement: any): Promise<void> {
    console.log(`[achievements] Awarding achievement "${achievement.title}" to ${userId}`);
    
    // First, check if there's an in-progress record
    let userAchievement = await UserAchievementModel.findOne({
      userId,
      achievementId: achievement._id
    });
    
    const now = new Date();
    
    if (!userAchievement) {
      // Create a new record
      userAchievement = new UserAchievementModel({
        userId,
        achievementId: achievement._id,
        earnedAt: now,
        progress: 100,
        completedAt: now
      });
    } else {
      // Update existing record
      userAchievement.progress = 100;
      userAchievement.completedAt = now;
    }
    
    await userAchievement.save();
    
    // Update user stats
    await UserStatsModel.findOneAndUpdate(
      { userId },
      { 
        $inc: { 
          achievementsEarned: 1,
          totalPoints: achievement.points
        }
      }
    );
    
    // For simplicity, calculate level as 1 + (totalPoints / 100)
    // This means every 100 points equals one level
    const userStats = await UserStatsModel.findOne({ userId });
    if (userStats) {
      const newLevel = Math.floor(1 + (userStats.totalPoints / 100));
      if (newLevel > userStats.level) {
        await UserStatsModel.findOneAndUpdate(
          { userId },
          { $set: { level: newLevel } }
        );
      }
    }
  }

  /**
   * Update the user's streak days
   */
  async updateUserStreak(userId: string): Promise<void> {
    const userStats = await UserStatsModel.findOne({ userId });
    if (!userStats) return;
    
    const lastActive = new Date(userStats.lastActive);
    const now = new Date();
    
    // Calculate days between last activity and now
    const oneDayMs = 24 * 60 * 60 * 1000;
    const daysBetween = Math.floor((now.getTime() - lastActive.getTime()) / oneDayMs);
    
    if (daysBetween === 1) {
      // User was active yesterday, increment streak
      await UserStatsModel.findOneAndUpdate(
        { userId },
        { 
          $inc: { streakDays: 1 },
          $set: { lastActive: now }
        }
      );
    } else if (daysBetween > 1) {
      // User was not active yesterday, reset streak
      await UserStatsModel.findOneAndUpdate(
        { userId },
        { 
          $set: { 
            streakDays: 1,
            lastActive: now 
          }
        }
      );
    } else {
      // User was already active today, just update timestamp
      await UserStatsModel.findOneAndUpdate(
        { userId },
        { $set: { lastActive: now } }
      );
    }
  }

  /**
   * Get all achievements
   */
  async getAllAchievements(): Promise<Achievement[]> {
    const achievements = await AchievementModel.find().sort({ points: 1 });
    return achievements.map(a => this.mapAchievementModelToSchema(a));
  }

  /**
   * Get achievements for a specific user
   */
  async getUserAchievements(userId: string): Promise<{
    earned: (Achievement & { earnedAt: Date, completedAt?: Date })[];
    available: Achievement[];
  }> {
    // Get all achievements
    const allAchievements = await AchievementModel.find();
    
    // Get user's earned achievements
    const userAchievements = await UserAchievementModel.find({ 
      userId,
      completedAt: { $ne: null }
    }).populate('achievementId');
    
    // Get IDs of earned achievements
    const earnedIds = userAchievements.map(ua => 
      ua.achievementId._id.toString()
    );
    
    // Split into earned and available
    const earned = userAchievements.map(ua => ({
      ...this.mapAchievementModelToSchema(ua.achievementId),
      earnedAt: ua.earnedAt,
      completedAt: ua.completedAt
    }));
    
    const available = allAchievements
      .filter(a => !earnedIds.includes(a._id.toString()))
      .map(a => this.mapAchievementModelToSchema(a));
    
    return { earned, available };
  }

  /**
   * Get user stats
   */
  async getUserStats(userId: string): Promise<UserStats | null> {
    const userStats = await UserStatsModel.findOne({ userId });
    if (!userStats) return null;
    
    return {
      id: userStats._id.toString(),
      userId: userStats.userId,
      displayName: userStats.displayName || null,
      totalPoints: userStats.totalPoints,
      level: userStats.level,
      eventsCreated: userStats.eventsCreated,
      eventsAttended: userStats.eventsAttended,
      tokensCollected: userStats.tokensCollected,
      achievementsEarned: userStats.achievementsEarned,
      streakDays: userStats.streakDays,
      lastActive: userStats.lastActive,
      joinedAt: userStats.joinedAt,
      profileImageUrl: userStats.profileImageUrl || null
    };
  }

  /**
   * Map MongoDB model to schema type
   */
  private mapAchievementModelToSchema(model: any): Achievement {
    return {
      id: model._id.toString(),
      title: model.title,
      description: model.description,
      type: model.type,
      category: model.category,
      badgeImageUrl: model.badgeImageUrl,
      points: model.points,
      rarity: model.rarity,
      requirementType: model.requirementType,
      requirementValue: model.requirementValue,
      requirementDetails: model.requirementDetails || null,
      createdAt: model.createdAt
    };
  }
}

// Export singleton instance
export const achievementService = new AchievementService();