import React from 'react';
import { Link, useRoute, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getEvent, claimToken, hasWalletClaimedToken } from '../lib/events';
import { claimCompressedToken } from '../lib/solana';
import { useSolana } from '../providers/SolanaProvider';
import { Event } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, BadgeCheck, Sparkle, Rocket } from 'lucide-react';

const ClaimToken: React.FC = () => {
  const [, params] = useRoute('/claim/:eventId');
  const [, navigate] = useLocation();
  const eventId = params?.eventId || null;
  const { publicKey, connected, connect } = useSolana();
  const { toast } = useToast();

  const { data: event, isLoading: isLoadingEvent, error: eventError } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  const { data: claimStatus, isLoading: isCheckingClaim } = useQuery<{ hasClaimed: boolean }>({
    queryKey: [`/api/events/${eventId}/claims/${publicKey?.toString()}`],
    enabled: !!eventId && !!publicKey,
    refetchOnWindowFocus: false,
    staleTime: 5000,
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!connected || !publicKey || !event) {
        throw new Error("Please connect your wallet first");
      }
      const { transactionSignature } = await claimCompressedToken(
        eventId!,
        event.tokenMintAddress,
        publicKey.toString()
      );
      const result = await claimToken(
        eventId!,
        event.tokenMintAddress,
        publicKey.toString(),
        transactionSignature
      );
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Token claimed successfully!",
        description: "The participation token has been added to your wallet.",
        variant: "default",
      });
      navigate(`/claim-success/${eventId}`);
    },
    onError: (error) => {
      let errorMessage = "An unexpected error occurred.";
      if (error instanceof Error) errorMessage = error.message;
      if (typeof errorMessage === 'string') {
        if (errorMessage.includes("Event not found")) errorMessage = "This event doesn't exist or has been deleted.";
        else if (errorMessage.includes("already claimed")) errorMessage = "You've already claimed a token for this event.";
        else if (errorMessage.includes("transaction")) errorMessage = "Blockchain transaction failed. Please try again.";
      }
      toast({
        title: "Failed to claim token",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleClaim = async () => {
    if (!connected) {
      try {
        await connect();
      } catch (error) {
        toast({
          title: "Failed to connect wallet",
          description: error instanceof Error ? error.message : "Failed to connect wallet",
          variant: "destructive",
        });
        return;
      }
    }
    claimMutation.mutate();
  };

  const isLoading = isLoadingEvent || isCheckingClaim || claimMutation.isPending;
  const alreadyClaimed = claimStatus?.hasClaimed;

  if (isLoadingEvent) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Skeleton className="w-20 h-20 rounded-full mx-auto" />
          <Skeleton className="h-8 w-64 mx-auto mt-4" />
          <Skeleton className="h-6 w-80 mx-auto mt-2" />
        </div>
        <div className="mt-10 max-w-2xl mx-auto">
          <Card className="glass-card animate-pulse">
            <CardContent className="p-6">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-24 w-full mt-6" />
              <Skeleton className="h-10 w-full mt-8" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Alert variant="destructive" className="max-w-2xl mx-auto glass-card">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Event Not Found</AlertTitle>
          <AlertDescription>
            We couldn't find the event you're looking for. It may have been removed or the link might be incorrect.
          </AlertDescription>
        </Alert>
        <div className="mt-6">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <Rocket className="h-5 w-5" />
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <span className="inline-flex items-center justify-center mb-4 p-3 rounded-full bg-primary/90 shadow-lg animate-fade-in">
          <BadgeCheck className="h-10 w-10 text-white animate-bounce" />
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground animate-gradient-x bg-gradient-to-r from-primary via-[#14F195] to-primary bg-clip-text text-transparent">Claim Your Participation Token</h1>
        <p className="mt-3 text-xl text-muted-foreground">
          You've been invited to claim a proof-of-participation token for attending:
        </p>
        <h2 className="mt-2 text-2xl font-bold text-primary">{event.name}</h2>
      </div>
      <div className="mt-10 max-w-2xl mx-auto">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="relative">
              <img
                src={event.imageUrl || 'https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80'}
                alt={`Digital Token for ${event.name}`}
                className="w-full h-auto rounded-lg shadow-md"
              />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary/90 text-white text-xs font-semibold shadow-lg flex items-center gap-1 animate-fade-in">
                <Sparkle className="h-4 w-4 animate-spin-slow" />
                Event
              </span>
            </div>
            <div className="mt-6 text-lg text-muted-foreground text-center">
              This compressed token (cToken) is a digital proof of your participation in <span className="font-bold text-primary">{event.name}</span>. It's stored efficiently on the Solana blockchain using ZK Compression technology.
            </div>
            {alreadyClaimed && (
              <Alert className="mt-6 bg-green-50 border-green-200 glass-card">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-800">Already Claimed</AlertTitle>
                <AlertDescription className="text-green-700">
                  You've already claimed this token. Check your wallet or view all your tokens in the My Tokens page.
                </AlertDescription>
              </Alert>
            )}
            <div className="mt-8 flex flex-col gap-4">
              <Button
                size="lg"
                className="gap-2 rounded-full shadow-lg text-lg"
                onClick={handleClaim}
                disabled={isLoading || alreadyClaimed}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">
                      <Sparkle className="h-5 w-5" />
                    </span>
                    {connected ? 'Claiming Token...' : 'Connecting Wallet...'}
                  </>
                ) : alreadyClaimed ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Token Already Claimed
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5" />
                    {connected ? 'Claim Token' : 'Connect Wallet to Claim'}
                  </>
                )}
              </Button>
              <Button asChild size="lg" variant="ghost" className="gap-2 border border-primary text-primary hover:bg-primary/10">
                <Link href="/my-tokens">
                  <BadgeCheck className="h-5 w-5" />
                  View My Tokens
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClaimToken;
