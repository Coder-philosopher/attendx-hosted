import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserAchievements, getUserStats } from '@/lib/events';
import { useSolana } from '@/providers/SolanaProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  Medal, 
  Star, 
  AlertCircle, 
  Sparkles, 
  Award,
  Crown,
  Target,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMedal, FaTrophy, FaCrown, FaAward } from 'react-icons/fa';
import { GiTrophyCup, GiLaurelCrown, GiAchievement } from 'react-icons/gi';

const AchievementCard = ({ achievement, earned = false }: { achievement: any, earned?: boolean }) => {
  const rarityColors = {
    common: 'bg-slate-200/90 text-slate-800',
    uncommon: 'bg-green-200/90 text-green-800',
    rare: 'bg-blue-200/90 text-blue-800',
    epic: 'bg-purple-200/90 text-purple-800',
    legendary: 'bg-yellow-200/90 text-amber-800',
  };

  const rarityIcons = {
    common: <Medal className="h-5 w-5 text-slate-800" strokeWidth={2.5} />,
    uncommon: <Award className="h-5 w-5 text-green-800" strokeWidth={2.5} />,
    rare: <Trophy className="h-5 w-5 text-blue-800" strokeWidth={2.5} />,
    epic: <Target className="h-5 w-5 text-purple-800" strokeWidth={2.5} />,
    legendary: <Crown className="h-5 w-5 text-amber-800" strokeWidth={2.5} />,
  };

  const rarityColor = rarityColors[achievement.rarity as keyof typeof rarityColors] || rarityColors.common;
  const rarityIcon = rarityIcons[achievement.rarity as keyof typeof rarityIcons] || rarityIcons.common;

  // Use the badgeImageUrl as-is, ensuring it starts with '/'
  const getImageUrl = (path: string): string | undefined => {
    if (!path) return undefined;
    return path.startsWith('/') ? path : `/${path}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`w-full backdrop-blur-sm bg-background/80 border-2 ${earned ? 'border-primary shadow-lg shadow-primary/20' : 'border-border/50 opacity-70'}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-bold text-foreground">{achievement.title}</CardTitle>
            <Badge className={`${rarityColor} gap-1.5 px-3 py-1 font-semibold`}>
              {rarityIcon}
              {achievement.rarity}
            </Badge>
          </div>
          <CardDescription className="text-sm mt-2 text-muted-foreground">{achievement.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            {achievement.badgeImageUrl ? (
              <motion.img 
                src={getImageUrl(achievement.badgeImageUrl)} 
                alt={achievement.title} 
                className="w-20 h-20 object-contain"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
                onError={(e) => {
                  // Fallback to default icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                }}
              />
            ) : null}
            {/* Fallback icon that shows if image fails to load or no image */}
            <motion.div 
              className={`w-20 h-20 rounded-full flex items-center justify-center ${earned ? 'bg-primary/20' : 'bg-muted'} fallback-icon${achievement.badgeImageUrl ? ' hidden' : ''}`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Trophy className={`h-10 w-10 ${earned ? 'text-primary' : 'text-muted-foreground'}`} strokeWidth={2} />
            </motion.div>
          </div>
        </CardContent>
        <CardFooter className="pt-0 flex justify-between items-center">
          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Star className="h-4 w-4 text-yellow-500" strokeWidth={2.5} />
            {achievement.points} points
          </div>
          {earned && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-sm font-medium text-primary flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
              EARNED
            </motion.div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const UserStatsCard = ({ stats }: { stats: any }) => {
  if (!stats) return null;

  const pointsToNextLevel = 100;
  const currentLevelPoints = (stats.level - 1) * pointsToNextLevel;
  const pointsInCurrentLevel = stats.totalPoints - currentLevelPoints;
  const percentToNextLevel = Math.min(100, (pointsInCurrentLevel / pointsToNextLevel) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="backdrop-blur-sm bg-background/60 border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              <Crown className="h-6 w-6 text-primary" strokeWidth={2.5} />
            </motion.div>
            Level {stats.level}
          </CardTitle>
          <CardDescription className="text-lg">
            {stats.totalPoints} total points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress to Level {stats.level + 1}</span>
                <span className="font-medium">{pointsInCurrentLevel}/{pointsToNextLevel} points</span>
              </div>
              <Progress value={percentToNextLevel} className="h-2 bg-primary/20" />
            </div>

            <Separator className="bg-border/50" />

            <div className="grid grid-cols-2 gap-6 pt-2">
              <motion.div 
                className="flex flex-col items-center p-4 rounded-lg bg-background/40"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-3xl font-bold text-primary">{stats.eventsCreated}</span>
                <span className="text-sm text-muted-foreground">Events Created</span>
              </motion.div>
              <motion.div 
                className="flex flex-col items-center p-4 rounded-lg bg-background/40"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-3xl font-bold text-primary">{stats.eventsAttended}</span>
                <span className="text-sm text-muted-foreground">Events Attended</span>
              </motion.div>
              <motion.div 
                className="flex flex-col items-center p-4 rounded-lg bg-background/40"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-3xl font-bold text-primary">{stats.achievementsEarned}</span>
                <span className="text-sm text-muted-foreground">Achievements</span>
              </motion.div>
              <motion.div 
                className="flex flex-col items-center p-4 rounded-lg bg-background/40"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-3xl font-bold text-primary">{stats.tokensCollected}</span>
                <span className="text-sm text-muted-foreground">Tokens Collected</span>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function UserAchievements() {
  const { publicKey } = useSolana();
  const walletAddress = publicKey?.toBase58();

  const { 
    data: achievementsData,
    isLoading: isLoadingAchievements,
    error: achievementsError
  } = useQuery({
    queryKey: ['achievements', walletAddress],
    queryFn: () => walletAddress ? getUserAchievements(walletAddress) : null,
    enabled: !!walletAddress
  });

  const { 
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery({
    queryKey: ['stats', walletAddress],
    queryFn: () => walletAddress ? getUserStats(walletAddress) : null,
    enabled: !!walletAddress
  });

  if (!walletAddress) {
    return (
      <Alert className="backdrop-blur-sm bg-background/60">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not connected</AlertTitle>
        <AlertDescription>
          Please connect your wallet to view your achievements.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoadingAchievements || isLoadingStats) {
    return (
      <div className="text-center py-12 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Trophy className="h-12 w-12 text-primary mx-auto" />
        </motion.div>
        <p className="text-muted-foreground">Loading achievements and stats...</p>
      </div>
    );
  }

  if (achievementsError || statsError) {
    return (
      <Alert variant="destructive" className="backdrop-blur-sm bg-background/60">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was an error loading your achievements. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <UserStatsCard stats={statsData} />

      <Tabs defaultValue="earned" className="w-full">
        <TabsList className="w-full bg-background/40 backdrop-blur-sm">
          <TabsTrigger value="earned" className="flex-1 data-[state=active]:bg-primary/10">
            Earned ({achievementsData?.earned?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="available" className="flex-1 data-[state=active]:bg-primary/10">
            Available ({achievementsData?.available?.length || 0})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="earned" className="mt-6">
          <AnimatePresence mode="wait">
            {achievementsData?.earned?.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {achievementsData.earned.map((achievement: any) => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement} 
                    earned={true}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center p-12 text-muted-foreground bg-background/40 backdrop-blur-sm rounded-lg"
              >
                <Star className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No achievements earned yet. Start creating or attending events!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
        
        <TabsContent value="available" className="mt-6">
          <AnimatePresence mode="wait">
            {achievementsData?.available?.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {achievementsData.available.map((achievement: any) => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement} 
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center p-12 text-muted-foreground bg-background/40 backdrop-blur-sm rounded-lg"
              >
                <FaCrown className="mx-auto h-12 w-12 mb-4 text-primary/50" />
                <p>All achievements have been earned. Congratulations!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}