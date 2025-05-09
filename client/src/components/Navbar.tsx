import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import WalletButton from './WalletButton';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { Menu, Sparkle, Rocket, UserCircle2, QrCode, BadgeCheck } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '/', label: 'Home', icon: <Sparkle className="h-4 w-4" /> },
  { href: '/create-event', label: 'Create Event', icon: <Rocket className="h-4 w-4" /> },
  { href: '/my-tokens', label: 'My Tokens', icon: <BadgeCheck className="h-4 w-4" /> },
  { href: '/achievements', label: 'Achievements', icon: <QrCode className="h-4 w-4" /> },
];

const Navbar: React.FC = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl mx-auto">
      <div className={`transition-all duration-300 rounded-full shadow-2xl border border-border glass-card backdrop-blur-md ${isScrolled ? (theme === 'dark' ? 'bg-black/80' : 'bg-white/80') : 'bg-background/60'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center group">
                <img src="/image.jpg" alt="Logo" className="h-10 w-10 rounded-full shadow-lg  group-hover:scale-110 transition-transform object-cover" />
                <span className="ml-2 text-2xl font-extrabold text-foreground tracking-tight animate-gradient-x bg-gradient-to-r from-primary via-[#14F195] to-primary bg-clip-text text-transparent">AttendX</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative inline-flex items-center gap-1 px-3 py-2 rounded-full font-medium text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${location === link.href ? 'bg-primary/10 text-primary shadow-md' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                    {location === link.href && (
                      <span className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-6 h-1 rounded-full bg-gradient-to-r from-primary to-[#14F195] blur-sm animate-pulse" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              <Button asChild size="sm" className="rounded-full shadow-md">
                <WalletButton />
              </Button>
              {/* Mobile menu button */}
              <div className="flex items-center sm:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMobileMenu}
                  aria-expanded={mobileMenuOpen ? 'true' : 'false'}
                  aria-controls="mobile-menu"
                  className="rounded-full"
                >
                  <span className="sr-only">Open main menu</span>
                  <Menu className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      <div
        className={`sm:hidden ${mobileMenuOpen ? 'block' : 'hidden'} bg-background/90 backdrop-blur-xl shadow-2xl border border-border rounded-2xl mt-2 animate-fade-in`}
        id="mobile-menu"
      >
        <div className="pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 block pl-3 pr-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${location === link.href ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
