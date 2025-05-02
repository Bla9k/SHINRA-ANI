// src/components/layout/TopBar.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react'; // Added useRef, useEffect
import Link from 'next/link';
import { Sparkles, Search as SearchIcon, Settings, X } from 'lucide-react'; // Added X icon
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
import { useAuth } from '@/hooks/useAuth'; // Corrected import path for useAuth hook
import anime from 'animejs'; // Import animejs

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
  const suggestionsRef = useRef<HTMLDivElement>(null); // Ref for suggestions box
  const inputRef = useRef<HTMLInputElement>(null); // Ref for the search input

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
    // Clear input and lose focus after submission
    setSearchTerm('');
    inputRef.current?.blur();
  };

  // --- Suggestion Click Handlers ---
  const handleSuggestionClick = (handler: () => void) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handler();
      setShowSuggestions(false); // Close suggestions after click
      setSearchTerm(''); // Clear search term
      inputRef.current?.blur(); // Lose focus
  };

  const handleAiSuggestion = handleSuggestionClick(() => {
      const term = searchTerm.trim();
      if (term) {
         onOpenAiSearch(term);
      }
  });

  const handleAdvancedSuggestion = handleSuggestionClick(() => {
      const term = searchTerm.trim();
      if (term) {
          onOpenAdvancedSearch(term);
      }
  });

  const handleFocus = () => {
    if (searchTerm.trim()) {
      setShowSuggestions(true);
    }
  };

   // Close suggestions when clicking outside
   useEffect(() => {
     const handleClickOutside = (event: MouseEvent) => {
       if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
           inputRef.current && !inputRef.current.contains(event.target as Node)) { // Also check if click is outside input
         setShowSuggestions(false);
       }
     };
     document.addEventListener('mousedown', handleClickOutside);
     return () => {
       document.removeEventListener('mousedown', handleClickOutside);
     };
   }, []);


  const handleLogout = async () => {
     try {
       await signOutUser();
       // Redirect or state update handled by AuthContext
     } catch (error) {
       console.error("Logout failed in TopBar:", error);
       // Show toast notification for error
     }
   };

   // Animate suggestions box
   useEffect(() => {
     if (suggestionsRef.current) {
       anime({
         targets: suggestionsRef.current,
         opacity: showSuggestions ? [0, 1] : [1, 0],
         translateY: showSuggestions ? [-5, 0] : [0, -5], // Reduced distance
         duration: 200, // Faster animation
         easing: 'easeOutQuad',
         begin: (anim) => {
           if (showSuggestions && suggestionsRef.current) {
             suggestionsRef.current.style.display = 'block';
           }
         },
         complete: (anim) => {
           if (!showSuggestions && suggestionsRef.current) {
             suggestionsRef.current.style.display = 'none';
           }
         },
       });
     }
   }, [showSuggestions]);


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
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
          <Input
            ref={inputRef} // Assign ref to input
            type="search"
            placeholder="Search anime, manga..."
            className="pl-9 pr-4 py-2 h-9 w-full glass border-primary/20 rounded-full transition-smooth"
            value={searchTerm}
            onChange={handleSearchInputChange}
            aria-label="Search"
            onFocus={handleFocus}
            // Removed onBlur to rely on click outside logic
          />
        </form>
         {/* Suggestions Box */}
        <div
            ref={suggestionsRef}
            className="absolute top-full left-0 mt-1.5 w-full z-50 bg-background/95 backdrop-blur-lg rounded-lg shadow-md border border-border/50 overflow-hidden" // Increased z-index, rounded-lg
            style={{ display: 'none' }} // Initially hidden, controlled by animation
        >
            {/* Advanced Search Suggestion */}
            <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground h-auto px-3 py-1.5 w-full text-left justify-start hover:bg-accent/50 hover:text-foreground transition-smooth"
                onMouseDown={handleAdvancedSuggestion} // Use onMouseDown to trigger before blur
            >
                <Settings className="w-3 h-3 mr-1.5 flex-shrink-0" /> Advanced Search for "{searchTerm}"
            </Button>
             {/* Nami AI Suggestion */}
             <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary h-auto px-3 py-1.5 w-full text-left justify-start hover:bg-primary/10 transition-smooth"
                onMouseDown={handleAiSuggestion} // Use onMouseDown
            >
                <Sparkles className="w-3 h-3 mr-1.5 flex-shrink-0" /> Use Nami AI for "{searchTerm}"?
            </Button>
        </div>
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

      {/* Profile Dropdown / Login Button */}
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full transition-smooth neon-glow-hover">
              <Avatar className="h-8 w-8">
                 <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                 {/* Fallback uses email initial if display name is missing */}
                 <AvatarFallback>{(user.displayName || user.email || 'U').slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass animate-fade-in">
             {/* Display email if name is unavailable */}
            <DropdownMenuLabel>{user.displayName || user.email || 'User Profile'}</DropdownMenuLabel>
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
