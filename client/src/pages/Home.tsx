import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getEvents } from '../lib/events';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Event } from '@shared/schema';
import { Sparkle, QrCode, BadgeCheck, Rocket, ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    refetchOnWindowFocus: false,
  });

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-background text-foreground h-[32rem] flex items-center justify-center overflow-hidden">
        {/* Animated SVG blob background */}
        <svg className="absolute left-1/2 top-0 -translate-x-1/2 opacity-30 blur-2xl animate-pulse" width="900" height="400" viewBox="0 0 900 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="450" cy="200" rx="350" ry="120" fill="url(#paint0_radial)" />
          <defs>
            <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientTransform="translate(450 200) scale(350 120)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9945FF" />
              <stop offset="1" stopColor="#14F195" />
            </radialGradient>
          </defs>
        </svg>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center">
          <span className="inline-flex items-center justify-center mb-4 p-3 rounded-full bg-primary/90 shadow-lg animate-fade-in">
            <Sparkle className="h-8 w-8 text-white animate-spin-slow" />
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-[#14F195] to-primary bg-clip-text text-transparent animate-gradient-x">
            Proof of Participation
            <span className="block text-4xl md:text-6xl font-bold mt-2 text-foreground">on Solana</span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg md:text-2xl text-muted-foreground animate-fade-in">
            Create and collect compressed tokens that prove your participation in events, efficiently stored on Solana using ZK Compression.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button asChild size="lg" className="gap-2 shadow-xl">
              <Link href="/create-event">
                <Rocket className="h-5 w-5" />
                Create Event
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="gap-2 shadow-xl">
              <Link href="/my-tokens">
                <BadgeCheck className="h-5 w-5" />
                View My Tokens
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase animate-fade-in">Features</h2>
            <p className="mt-2 text-4xl leading-8 font-extrabold tracking-tight text-foreground animate-fade-in">
              A better way to prove participation
            </p>
            <p className="mt-4 max-w-2xl text-xl text-muted-foreground lg:mx-auto animate-fade-in">
              Using Solana's ZK Compression, we've created a gas-efficient way to issue and collect proof-of-participation tokens.
            </p>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <Card className="relative glass-card group transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center justify-center h-14 w-14 rounded-full bg-primary shadow-lg group-hover:scale-110 transition-transform">
                <Rocket className="h-7 w-7 text-white animate-bounce" />
              </div>
              <CardContent className="pt-10">
                <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                  Create Events
                </h3>
                <p className="text-base text-muted-foreground">
                  Easily create events and mint compressed tokens (cTokens) as unique badges for attendance verification.
                </p>
              </CardContent>
            </Card>
            <Card className="relative glass-card group transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center justify-center h-14 w-14 rounded-full bg-green-500 shadow-lg group-hover:scale-110 transition-transform">
                <QrCode className="h-7 w-7 text-white animate-pulse" />
              </div>
              <CardContent className="pt-10">
                <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                  QR Verification
                </h3>
                <p className="text-base text-muted-foreground">
                  Generate unique QR codes for each event allowing attendees to claim tokens via Solana Pay.
                </p>
              </CardContent>
            </Card>
            <Card className="relative glass-card group transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center justify-center h-14 w-14 rounded-full bg-blue-500 shadow-lg group-hover:scale-110 transition-transform">
                <BadgeCheck className="h-7 w-7 text-white animate-spin-slow" />
              </div>
              <CardContent className="pt-10">
                <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                  Collect Tokens
                </h3>
                <p className="text-base text-muted-foreground">
                  Build a collection of attendance tokens that prove your participation history in various events.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Recent Events Section */}
      <div className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase animate-fade-in">Discover</h2>
            <p className="mt-2 text-4xl leading-8 font-extrabold tracking-tight text-foreground animate-fade-in">Recent Events</p>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden glass-card animate-pulse">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6">
                    <div className="flex items-baseline gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="mt-2 h-7 w-3/4" />
                    <Skeleton className="mt-2 h-16 w-full" />
                    <div className="mt-4">
                      <Skeleton className="h-5 w-28" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : error ? (
              <div className="col-span-full text-center">
                <p className="text-red-500 flex flex-col items-center gap-2">
                  <Rocket className="mx-auto h-8 w-8 animate-bounce text-destructive" />
                  Failed to load events. Please try again later.
                </p>
              </div>
            ) : events && events.length > 0 ? (
              events?.slice(0, 3).map((event: Event) => (
                <Card key={event.id} className="overflow-hidden glass-card group transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className="relative">
                    <img 
                      src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80'} 
                      alt={`${event.name} Event`} 
                      className="h-48 w-full object-cover rounded-t-lg group-hover:brightness-90 transition-all duration-300" 
                    />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-green-500/90 text-white text-xs font-semibold shadow-lg flex items-center gap-1 animate-fade-in">
                      <BadgeCheck className="h-4 w-4" /> Active
                    </span>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-baseline gap-2">
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-accent text-accent-foreground">
                        {format(new Date(event.date), 'MMMM d, yyyy')}
                      </span>
                    </div>
                    <h3 className="mt-2 text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 flex items-center gap-2">
                      <Sparkle className="h-5 w-5 text-primary animate-spin-slow" />
                      {event.name}
                    </h3>
                    <p className="mt-2 text-muted-foreground text-sm min-h-[48px]">{event.description}</p>
                    <div className="mt-4 flex justify-end">
                      <Button asChild size="sm" variant="outline" className="gap-2 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <Link href={`/claim/${event.id}`}>
                          <ArrowRight className="h-4 w-4" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center flex flex-col items-center gap-4 py-12 animate-fade-in">
                <Sparkle className="h-12 w-12 text-primary animate-pulse" />
                <p className="text-lg text-muted-foreground">No events available. Be the first to create one!</p>
                <Button asChild size="lg" className="gap-2">
                  <Link href="/create-event">
                    <Rocket className="h-5 w-5" />
                    Create Your First Event
                  </Link>
                </Button>
              </div>
            )}
          </div>

          <div className="mt-16 text-center animate-fade-in">
            <Button asChild size="lg" variant="ghost" className="gap-2 border border-primary text-primary hover:bg-primary/10">
              <Link href="/create-event">
                <ArrowRight className="h-5 w-5" />
                View All Events
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
