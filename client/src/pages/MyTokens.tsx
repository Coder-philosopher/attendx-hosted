import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getTokensByWallet } from '../lib/events';
import { useSolana } from '../providers/SolanaProvider';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Alert, AlertDescription, AlertTitle
} from '@/components/ui/alert';
import {
  AlertCircle, LogOut, Info as InfoIcon,
  ExternalLink, BadgeCheck, Sparkle, Wallet, Rocket
} from 'lucide-react';
import { truncateAddress } from '../lib/solana';
import { TokenClaim, Event } from '@shared/schema';

const MyTokens: React.FC = () => {
  const { publicKey, connected, disconnect } = useSolana();

  const { data: tokenClaims, isLoading, error } = useQuery<(TokenClaim & { event?: Event })[]>({
    queryKey: publicKey ? [`/api/wallets/${publicKey.toString()}/claims`] : [],
    queryFn: () => getTokensByWallet(publicKey!.toString()),
    enabled: !!publicKey,
    refetchOnWindowFocus: false,
  });

  const validClaims = tokenClaims?.filter(claim => claim.event) ?? [];

  if (!connected) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="mb-12">
          <span className="inline-flex items-center justify-center mb-4 p-3 rounded-full bg-primary/90 shadow-lg animate-fade-in">
            <BadgeCheck className="h-8 w-8 text-white animate-bounce" />
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-primary via-[#14F195] to-primary bg-clip-text text-transparent animate-gradient-x">
            My Participation Tokens
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-muted-foreground">
            Connect your wallet to view your tokens.
          </p>
        </div>
        <Alert className="max-w-md mx-auto glass-card">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Wallet not connected</AlertTitle>
          <AlertDescription>
            Please connect your Solana wallet to view your participation tokens.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-flex items-center justify-center mb-4 p-3 rounded-full bg-primary/90 shadow-lg animate-fade-in">
          <Sparkle className="h-8 w-8 text-white animate-spin-slow" />
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-primary via-[#14F195] to-primary bg-clip-text text-transparent animate-gradient-x">
          My Participation Tokens
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-muted-foreground">
          View all your proof-of-participation compressed tokens from events.
        </p>
      </div>

      {/* Wallet Info */}
      <Card className="mb-6 glass-card">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="text-foreground font-medium">Connected Wallet:</span>
            <span className="ml-2 text-primary font-mono text-base">
              {publicKey ? truncateAddress(publicKey.toString()) : ''}
            </span>
          </div>
          <Button onClick={disconnect} size="sm" variant="outline" className="gap-2 rounded-full">
            <LogOut className="h-4 w-4" /> Disconnect
          </Button>
        </CardContent>
      </Card>

      {/* Demo Info */}
      <Card className="mb-6 glass-card border-blue-100">
        <CardContent className="p-4 flex items-center gap-4">
          <InfoIcon className="h-6 w-6 text-blue-500 animate-pulse" />
          <div>
            <h3 className="text-base font-semibold text-blue-800">Demo Information</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This app supports Phantom, Backpack, and MetaMask wallets. Demo mode simulates transactions; real ones won’t appear in explorers.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tokens */}
      {isLoading ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden glass-card animate-pulse">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-1 h-4 w-1/2" />
                <div className="mt-4 pt-4 border-t border-border">
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="mt-4">
                  <Skeleton className="h-5 w-28" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive" className="glass-card">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error loading tokens</AlertTitle>
          <AlertDescription>Failed to load your tokens. Please try again later.</AlertDescription>
        </Alert>
      ) : validClaims.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {validClaims.map((claim) => {
            const event = claim.event!;
            return (
              <Card key={claim.id} className="overflow-hidden glass-card group transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="relative">
                  <img
                    src={event.imageUrl}
                    alt={`${event.name} Token`}
                    className="h-48 w-full object-cover rounded-t-lg group-hover:brightness-90 transition-all duration-300"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary/90 text-white text-xs font-semibold shadow-lg flex items-center gap-1 animate-fade-in">
                    <BadgeCheck className="h-4 w-4" />
                    Token
                  </span>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary flex items-center gap-2">
                    <Sparkle className="h-5 w-5 text-primary animate-spin-slow" />
                    {event.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {format(new Date(event.date), 'MMMM d, yyyy')}
                  </p>
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Token ID</span>
                      <span className="text-xs font-mono text-foreground">
                        {truncateAddress(event.tokenMintAddress)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    {claim.transactionSignature && (
                      <Button asChild size="sm" variant="outline" className="gap-2 group-hover:bg-primary/10 group-hover:text-primary">
                        <a
                          href={`https://explorer.solana.com/tx/${claim.transactionSignature}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Transaction
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 flex flex-col items-center gap-4 animate-fade-in">
          <Rocket className="h-12 w-12 text-primary animate-bounce" />
          <h3 className="mt-4 text-xl font-bold text-foreground">No tokens found</h3>
          <p className="mt-1 text-base text-muted-foreground">
            You haven’t claimed any participation tokens yet.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <Sparkle className="h-5 w-5" />
              Browse Events
            </Link>
          </Button>
        </div>
      )}

      {/* Browse More */}
      <div className="mt-10 text-center">
        <Button asChild variant="ghost" size="lg" className="gap-2 border border-primary text-primary hover:bg-primary/10">
          <Link href="/">
            <Rocket className="h-5 w-5" />
            Browse More Events
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default MyTokens;
