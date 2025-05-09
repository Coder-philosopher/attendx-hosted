import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sparkle, Twitter, Github, BadgeCheck, Users } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-background/80 border-t border-border backdrop-blur-md glass-card">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="inline-flex items-center justify-center mb-2 p-2 rounded-full bg-primary/90 shadow-lg animate-fade-in">
              <Sparkle className="h-6 w-6 text-white animate-spin-slow" />
            </span>
            <h3 className="text-xl font-extrabold text-foreground tracking-tight">AttendX</h3>
            <p className="text-muted-foreground text-sm">Proof of Participation on Solana</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground mb-2">Quick Links</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button asChild variant="ghost" size="sm" className="rounded-full px-4">
                <Link href="/">Home</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="rounded-full px-4">
                <Link href="/create-event">Create Event</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="rounded-full px-4">
                <Link href="/my-tokens">My Tokens</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="rounded-full px-4">
                <Link href="/achievements">Achievements</Link>
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <h3 className="text-lg font-semibold text-foreground mb-2">Connect</h3>
            <div className="flex gap-3">
              <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                <a href="https://twitter.com/attendx" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter className="h-5 w-5 text-primary" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                <a href="https://github.com/attendx" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <Github className="h-5 w-5 text-foreground" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                <a href="https://discord.gg/attendx" target="_blank" rel="noopener noreferrer" aria-label="Discord">
                  <Users className="h-5 w-5 text-blue-500" />
                </a>
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
            <BadgeCheck className="h-4 w-4 text-primary animate-bounce" />
            © {new Date().getFullYear()} AttendX. All rights reserved.
          </p>
        </div>
        <footer className="w-full text-center py-4 text-muted-foreground text-sm">
          Made by <a href="https://x.com/abds_dev" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">Abdullah</a>
        </footer>
      </div>
    </footer>
  );
};

export default Footer;
