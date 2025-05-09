import React, { useState, useEffect, Suspense } from 'react';
import UserAchievements from '@/components/UserAchievements';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSolana } from '@/providers/SolanaProvider';
import { checkAchievements } from '@/lib/events';
import { TrophyIcon, CheckCircleIcon, AwardIcon } from 'lucide-react';
import { FaMedal, FaStar, FaCrown, FaTrophy } from 'react-icons/fa';
import { GiLaurelsTrophy, GiAchievement, GiTrophyCup } from 'react-icons/gi';
import { motion } from 'framer-motion';

// Lazy load Confetti component
const Confetti = React.lazy(() => import('react-confetti'));

export default function Achievements() {
  const { publicKey } = useSolana();
  const { toast } = useToast();
  const walletAddress = publicKey?.toBase58();
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleManualCheck = async (type: 'creator' | 'participant') => {
    if (!walletAddress) return;

    try {
      await checkAchievements(walletAddress, type);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      toast({
        title: 'Achievement Check',
        description: `Checked ${type} achievements successfully.`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to check achievements: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-[#14F195]/20 rounded-full blur-3xl" />
      </div>

      {/* Confetti effect for celebration */}
      {showConfetti && (
        <Suspense fallback={null}>
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={200}
            recycle={false}
            className="pointer-events-none fixed top-0 left-0 w-full h-full z-50"
          />
        </Suspense>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col space-y-8">
            {/* Header Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="relative">
                <span className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-yellow-400 to-pink-500 shadow-lg animate-bounce">
                  <GiLaurelsTrophy className="h-10 w-10 text-white" />
                </span>
                <FaCrown className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-spin-slow" />
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-[#14F195] to-primary bg-clip-text text-transparent animate-gradient-x">
                Achievements
              </h1>
              <p className="text-muted-foreground text-lg flex items-center gap-3 max-w-2xl">
                <FaStar className="text-yellow-400 animate-pulse" />
                Track your progress, earn achievements, and level up as you create and attend events.
                <FaMedal className="text-blue-400 animate-pulse" />
              </p>
            </motion.div>

            {/* Action Buttons */}
            {walletAddress && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center gap-4"
              >
                <Button 
                  variant="outline" 
                  size="lg"
                  className="gap-2 rounded-full shadow-lg hover:bg-primary/10 transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-sm border-primary/20"
                  onClick={() => handleManualCheck('creator')}
                >
                  <CheckCircleIcon className="h-5 w-5" />
                  Check Creator Achievements
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="gap-2 rounded-full shadow-lg hover:bg-primary/10 transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-sm border-primary/20"
                  onClick={() => handleManualCheck('participant')}
                >
                  <AwardIcon className="h-5 w-5" />
                  Check Participant Achievements
                </Button>
              </motion.div>
            )}

            {/* Achievements Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-background/40 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-border/50"
            >
              <UserAchievements />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}