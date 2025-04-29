// src/components/layout/TopBar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Search as SearchIcon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuth } from '@/context/AuthContext'; // Import useAuth directly from context

interface TopBarProps {
  onSearchIconClick: () => void;
  onSearchSubmit: (term: string) => void;
  onAiToggle: () => void;
  isAiSearchActive: boolean;
  onOpenAiSearch: (term: string) => void;
  onOpenAdvancedSearch: (term: string) => void;
  className?: string;
}

// New Abstract Logo SVG
const ShinraAniLogo = () => (
  <svg
    width="28" // Slightly larger
    height="28"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-primary transition-transform duration-300 hover:scale-110" // Added hover effect
  >
    <path
      d="M50 0 L65 20 L85 15 L75 40 L95 50 L75 60 L85 85 L65 80 L50 100 L35 80 L15 85 L25 60 L5 50 L25 40 L15 15 L35 20 Z"
      fill="currentColor"
      stroke="hsl(var(--primary-foreground))" // Outline with foreground color
      strokeWidth="2" // Thinner stroke
      transform="rotate(15 50 50)" // Slight rotation for dynamic feel
    />
    <circle cx="50" cy="50" r="12" fill="hsl(var(--background))" /> {/* Inner circle with background color */}
    <path d="M50 40 L55 50 L50 60 L45 50 Z" fill="currentColor"/> {/* Small diamond shape inside */}
  </svg>
);


export default function TopBar({
  onSearchIconClick,
  onSearchSubmit,
  onAiToggle,
  isAiSearchActive,
  onOpenAiSearch,
  onOpenAdvancedSearch,
  className,
}: TopBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { user, signOutUser } = useAuth(); // Get user and signOut from auth context

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    setShowSuggestions(!!term.trim());
  };

  const handleSearchFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = searchTerm.trim();
    setShowSuggestions(false);
    if (term) {
      onSearchSubmit(term);
    } else {
      onSearchIconClick();
    }
  };

  const handleAiSuggestionClick = () => {
    const term = searchTerm.trim();
    if (term) {
      onOpenAiSearch(term);
      setShowSuggestions(false);
      setSearchTerm('');
    }
  };

  const handleAdvancedSuggestionClick = () => {
    const term = searchTerm.trim();
    if (term) {
      onOpenAdvancedSearch(term);
      setShowSuggestions(false);
      setSearchTerm('');
    }
  };

  const handleFocus = () => {
    if (searchTerm.trim()) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleLogout = async () => {
     try {
       await signOutUser();
       // Redirect or state update handled by AuthContext
     } catch (error) {
       console.error("Logout failed in TopBar:", error);
       // Show toast notification for error
     }
   };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 items-center gap-2 md:gap-4 border-b bg-background/80 px-4 backdrop-blur-md glass transition-smooth',
        className
      )}
    >
      <Link href="/" className="flex items-center gap-2 mr-auto transition-smooth">
        <ShinraAniLogo /> {/* Use the new logo component */}
        <span className="font-bold text-lg hidden sm:inline">Shinra-Ani</span>
      </Link>

      {/* Search Input with Suggestions */}
      <div className="relative hidden md:block">
        <form onSubmit={handleSearchFormSubmit} className="flex items-center w-full max-w-xs lg:max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search anime, manga..."
            className="pl-9 pr-4 py-2 h-9 w-full glass border-primary/20 rounded-full transition-smooth"
            value={searchTerm}
            onChange={handleSearchInputChange}
            aria-label="Search"
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </form>
        {showSuggestions && (
          <div
            className="absolute top-full left-0 mt-1.5 w-full z-10 bg-background/90 backdrop-blur-sm rounded shadow-md border border-border/50 overflow-hidden animate-fade-in"
            onMouseDown={(e) => e.preventDefault()}
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground h-auto px-3 py-1.5 w-full text-left justify-start hover:bg-accent/50 hover:text-foreground transition-smooth"
              onClick={handleAdvancedSuggestionClick}
            >
              <Settings className="w-3 h-3 mr-1.5 flex-shrink-0" /> Advanced Search for "{searchTerm}"
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary h-auto px-3 py-1.5 w-full text-left justify-start hover:bg-primary/10 transition-smooth"
              onClick={handleAiSuggestionClick}
            >
              <Sparkles className="w-3 h-3 mr-1.5 flex-shrink-0" /> Use Nami AI for "{searchTerm}"?
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Search Icon */}
      <Button variant="ghost" size="icon" className="rounded-full md:hidden transition-smooth neon-glow-hover" onClick={onSearchIconClick}>
        <SearchIcon className="h-5 w-5" />
        <span className="sr-only">Open Search</span>
      </Button>

      {/* AI Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'rounded-full neon-glow-hover transition-smooth',
          isAiSearchActive && 'bg-primary/20 text-primary neon-glow'
        )}
        onClick={onAiToggle}
        aria-pressed={isAiSearchActive}
        aria-label={isAiSearchActive ? 'Deactivate AI Search Mode' : 'Activate AI Search Mode'}
      >
        <Sparkles className="h-5 w-5" />
        <span className="sr-only">{isAiSearchActive ? 'Deactivate AI Search Mode' : 'Activate AI Search Mode'}</span>
      </Button>

      {/* Profile Dropdown */}
      {user ? ( // Check if user exists
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full transition-smooth neon-glow-hover">
              <Avatar className="h-8 w-8">
                 <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                 <AvatarFallback>{(user.displayName || 'U').slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass animate-fade-in">
            <DropdownMenuLabel>{user.displayName || 'User Profile'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link href="/login" passHref legacyBehavior>
           {/* Added anchor tag for legacyBehavior */}
           <a>
              <Button variant="outline" className="neon-glow-hover transition-smooth">Login</Button>
           </a>
        </Link>
      )}
    </header>
  );
}
