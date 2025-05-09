import React, { useState } from 'react';
import { Link, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getEvent, generateClaimUrl } from '../lib/events';
import { format } from 'date-fns';
import QRCode from '../components/QRCode';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Sparkle, ExternalLink, Copy, Rocket, BadgeCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const EventSuccess: React.FC = () => {
  const [, params] = useRoute('/event-success/:id');
  const eventId = params?.id || null;
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const { toast } = useToast();

  const { data: event, isLoading, error } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId,
    refetchOnWindowFocus: false,
  });

  const claimUrl = eventId ? generateClaimUrl(eventId) : '';

  const copyToClipboard = () => {
    if (claimUrl) {
      navigator.clipboard.writeText(claimUrl);
      setCopiedToClipboard(true);
      toast({
        title: "Copied to clipboard",
        description: "The claim link has been copied to your clipboard.",
        variant: "default",
      });
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="inline-flex items-center justify-center mb-4 p-3 rounded-full bg-green-500 shadow-lg animate-fade-in">
            <CheckCircle className="h-8 w-8 text-white animate-bounce" />
          </span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground animate-gradient-x bg-gradient-to-r from-primary via-[#14F195] to-primary bg-clip-text text-transparent">Event Created Successfully!</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-muted-foreground sm:mt-4">
            Loading event details...
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Card className="glass-card animate-pulse">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-64 my-2" />
              <Skeleton className="h-6 w-full my-2" />
              <Skeleton className="h-6 w-1/2 my-2" />
            </CardContent>
          </Card>
          <Card className="mt-10 glass-card animate-pulse">
            <CardContent className="p-6 text-center">
              <Skeleton className="h-6 w-64 mx-auto my-2" />
              <Skeleton className="h-64 w-64 mx-auto my-6" />
              <Skeleton className="h-6 w-full my-2" />
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
          <AlertTitle>Error Loading Event</AlertTitle>
          <AlertDescription>
            Failed to load event details. Please try again.
          </AlertDescription>
        </Alert>
        <div className="mt-6">
          <Button asChild size="lg" className="gap-2">
            <Link href="/create-event">
              <Rocket className="h-5 w-5" />
              Back to Create Event
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <span className="inline-flex items-center justify-center mb-4 p-3 rounded-full bg-green-500 shadow-lg animate-fade-in">
          <CheckCircle className="h-8 w-8 text-white animate-bounce" />
        </span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground animate-gradient-x bg-gradient-to-r from-primary via-[#14F195] to-primary bg-clip-text text-transparent">Event Created Successfully!</h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-muted-foreground sm:mt-4">
          Your event has been created and a compressed token (cToken) has been minted on Solana.
        </p>
      </div>
      <div className="max-w-3xl mx-auto">
        <Card className="glass-card">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-bold text-foreground flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-primary animate-spin-slow" />
              Event Details
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Share the QR code with attendees to let them claim the token.</p>
          </div>
          <div className="border-t border-border">
            <dl>
              <div className="bg-background/80 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-muted-foreground">Event Name</dt>
                <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">{event.name}</dd>
              </div>
              <div className="bg-background px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-muted-foreground">Date</dt>
                <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
                  {format(new Date(event.date), 'MMMM d, yyyy')}
                </dd>
              </div>
              <div className="bg-background/80 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-muted-foreground">Transaction</dt>
                <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">
                  <a
                    href={`https://explorer.solana.com/tx/${event.tokenMintAddress}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 flex items-center"
                  >
                    {event.tokenMintAddress.substring(0, 10)}...{event.tokenMintAddress.substring(event.tokenMintAddress.length - 5)}
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </Card>
        <div className="mt-10">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg leading-6 font-bold text-foreground flex items-center gap-2">
                  <Sparkle className="h-5 w-5 text-primary animate-spin-slow" />
                  QR Code for Attendees
                </h3>
                <p className="mt-1 max-w-2xl mx-auto text-sm text-muted-foreground">
                  Attendees can scan this QR code to claim their proof-of-participation token.
                </p>
                <div className="mt-6 flex justify-center">
                  <QRCode
                    value={claimUrl}
                    size={256}
                  />
                </div>
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground mb-2">Or share this claim link:</p>
                  <div className="flex rounded-md shadow-sm">
                    <input
                      type="text"
                      readOnly
                      value={claimUrl}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md focus:ring-primary focus:border-primary sm:text-sm border-border bg-background"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={copyToClipboard}
                      className="rounded-l-none"
                      aria-label="Copy claim link"
                    >
                      {copiedToClipboard ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-primary" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <Button asChild size="lg" className="gap-2">
            <Link href="/create-event">
              <Rocket className="h-5 w-5" />
              Create Another Event
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="gap-2 border border-primary text-primary hover:bg-primary/10">
            <Link href="/">
              <BadgeCheck className="h-5 w-5" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventSuccess;
