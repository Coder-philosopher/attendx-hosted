import { Express, Request, Response } from 'express';
import { achievementService } from './achievement-service';
import { initializeAchievements } from './mongodb-achievements';

export async function registerAchievementRoutes(app: Express): Promise<void> {
  // Initialize default achievements
  await initializeAchievements();

  // Get all achievements
  app.get('/api/achievements', async (req: Request, res: Response) => {
    try {
      const achievements = await achievementService.getAllAchievements();
      res.json(achievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // Get achievements for a specific user
  app.get('/api/users/:walletAddress/achievements', async (req: Request, res: Response) => {
    try {
      const { walletAddress } = req.params;
      const achievements = await achievementService.getUserAchievements(walletAddress);
      res.json(achievements);
    } catch (error) {
      console.error(`Error fetching achievements for user ${req.params.walletAddress}:`, error);
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });

  // Get user stats
  app.get('/api/users/:walletAddress/stats', async (req: Request, res: Response) => {
    try {
      const { walletAddress } = req.params;
      
      // Initialize stats if they don't exist
      await achievementService.initUserStats(walletAddress);
      
      // Update streak
      await achievementService.updateUserStreak(walletAddress);
      
      // Get stats
      const stats = await achievementService.getUserStats(walletAddress);
      
      if (!stats) {
        return res.status(404).json({ message: "User stats not found" });
      }
      
      res.json(stats);
    } catch (error) {
      console.error(`Error fetching stats for user ${req.params.walletAddress}:`, error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Manually trigger achievement check for a user (for testing)
  app.post('/api/users/:walletAddress/achievements/check', async (req: Request, res: Response) => {
    try {
      const { walletAddress } = req.params;
      const { type } = req.body;
      
      if (!type || !['creator', 'participant'].includes(type)) {
        return res.status(400).json({ message: "Invalid achievement type" });
      }
      
      await achievementService.checkForAchievements(walletAddress, type);
      
      res.json({ message: "Achievement check triggered" });
    } catch (error) {
      console.error(`Error checking achievements for user ${req.params.walletAddress}:`, error);
      res.status(500).json({ message: "Failed to check achievements" });
    }
  });
}