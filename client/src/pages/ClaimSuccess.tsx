import React from 'react';
import { Link, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getEvent } from '../lib/events';
import { Event } from '@shared/schema';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExternalLink, CheckCircle, Sparkle, Copy, BadgeCheck, Rocket } from 'lucide-react';

const ClaimSuccess: React.FC = () => {
  const [, params] = useRoute('/claim-success/:eventId');
  const eventId = params?.eventId || null;

  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId,
    refetchOnWindowFocus: false,
  });

  const handleCopy = () => {
    if (event?.tokenMintAddress) {
      navigator.clipboard.writeText(event.tokenMintAddress);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-8 w-80 mx-auto mt-4" />
          <Skeleton className="h-6 w-96 mx-auto mt-2" />
        </div>
        <div className="mt-10 max-w-2xl mx-auto">
          <Card className="glass-card animate-pulse">
            <CardContent className="p-6">
              <Skeleton className="h-64 w-64 mx-auto" />
              <Skeleton className="h-6 w-40 mx-auto mt-6" />
              <Skeleton className="h-4 w-20 mx-auto mt-1" />
              <Skeleton className="h-48 w-full mt-8" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Alert variant="destructive" className="max-w-2xl mx-auto glass-card">
          <Sparkle className="h-6 w-6 text-destructive animate-bounce" />
          <AlertTitle>Error Loading Token</AlertTitle>
          <AlertDescription>
            Failed to load token details. Please try again.
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
        <span className="inline-flex items-center justify-center mb-4 p-3 rounded-full bg-green-500 shadow-lg animate-fade-in">
          <CheckCircle className="h-8 w-8 text-white animate-bounce" />
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground animate-gradient-x bg-gradient-to-r from-primary via-[#14F195] to-primary bg-clip-text text-transparent">Token Claimed Successfully!</h1>
        <p className="mt-3 text-xl text-muted-foreground">
          The <span className="font-bold text-primary">{event.name}</span> participation token has been added to your wallet.
        </p>
      </div>
      <div className="mt-10 max-w-2xl mx-auto">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <img
                src={event.imageUrl || 'https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80'}
                alt={`Digital Token for ${event.name}`}
                className="w-64 h-auto rounded-lg shadow-md"
              />
              <div className="mt-6 text-center">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-primary animate-spin-slow" />
                  {event.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{format(new Date(event.date), 'MMMM d, yyyy')}</p>
              </div>
            </div>
            <div className="mt-8 border-t border-border pt-6">
              <dl className="divide-y divide-border">
                <div className="py-4 flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">Token Type</dt>
                  <dd className="text-sm text-foreground">Compressed NFT (cNFT)</dd>
                </div>
                <div className="py-4 flex justify-between items-center">
                  <dt className="text-sm font-medium text-muted-foreground">Token ID</dt>
                  <dd className="text-sm text-foreground flex items-center gap-1">
                    {event.tokenMintAddress.substring(0, 5)}...{event.tokenMintAddress.substring(event.tokenMintAddress.length - 4)}
                    <Button variant="ghost" size="icon" className="ml-1" onClick={handleCopy} aria-label="Copy Token ID">
                      <Copy className="h-4 w-4 text-primary" />
                    </Button>
                  </dd>
                </div>
                <div className="py-4 flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">Transaction</dt>
                  <dd className="text-sm text-foreground">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded">
                      Demo Mode
                    </span>
                  </dd>
                </div>
                <div className="py-4">
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-xs text-blue-700">
                      <span className="font-medium">Note:</span> In this demo, we're using simulated transactions that won't appear on the Solana Explorer. In a production environment, this would link to a real transaction on the blockchain.
                    </p>
                  </div>
                </div>
              </dl>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link href="/my-tokens">
                  <BadgeCheck className="h-5 w-5" />
                  View My Tokens
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="gap-2 border border-primary text-primary hover:bg-primary/10">
                <Link href="/">
                  <Rocket className="h-5 w-5" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClaimSuccess;
