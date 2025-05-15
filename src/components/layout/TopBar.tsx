
// src/components/layout/TopBar.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Search as SearchIcon, Settings, X, Menu } from 'lucide-react';
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
import { useAuth } from '@/hooks/useAuth';
import { useAnimation } from '@/context/AnimationContext';

interface TopBarProps {
  onSearchIconClick: () => void;
  onSearchSubmit: (term: string) => void;
  onAiToggle: () => void;
  isAiSearchActive: boolean;
  onOpenAiSearch: (term: string) => void;
  onOpenAdvancedSearch: (term: string) => void;
  className?: string;
}

const ShinraAniLogo = () => (
  <svg
    width="32" // Increased size
    height="32"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-primary transition-transform duration-300 hover:scale-110 group-hover:rotate-[15deg]" // Added group hover rotation
  >
    <defs>
        <filter id="neon-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
    </defs>
    <path
      d="M50 0 L65 20 L85 15 L75 40 L95 50 L75 60 L85 85 L65 80 L50 100 L35 80 L15 85 L25 60 L5 50 L25 40 L15 15 L35 20 Z"
      fill="currentColor"
      stroke="hsl(var(--primary-foreground))"
      strokeWidth="2.5" // Slightly thicker for better definition
      transform="rotate(15 50 50)"
      className="group-hover:filter group-hover:drop-shadow-[0_0_3px_hsl(var(--primary))]" // Subtle glow on hover
    />
    <circle cx="50" cy="50" r="12" fill="hsl(var(--background))" />
    <path d="M50 40 L55 50 L50 60 L45 50 Z" fill="currentColor"/>
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
  const { user, signOutUser } = useAuth();
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { playAnimation } = useAnimation();

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
      onSearchSubmit(term); // This will open search with standard mode
    } else {
      onSearchIconClick(); // Toggle search popup if term is empty
    }
    setSearchTerm('');
    inputRef.current?.blur();
  };

  const handleSuggestionClick = (handler: () => void) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handler();
      setShowSuggestions(false);
      setSearchTerm('');
      inputRef.current?.blur();
  };

  const handleAiSuggestion = handleSuggestionClick(() => {
      const term = searchTerm.trim();
      if (term) onOpenAiSearch(term);
  });

  const handleAdvancedSuggestion = handleSuggestionClick(() => {
      const term = searchTerm.trim();
      if (term) onOpenAdvancedSearch(term);
  });

  const handleFocus = () => {
    if (searchTerm.trim()) setShowSuggestions(true);
  };

   useEffect(() => {
     const handleClickOutside = (event: MouseEvent) => {
       if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
           inputRef.current && !inputRef.current.contains(event.target as Node)) {
         setShowSuggestions(false);
       }
     };
     document.addEventListener('mousedown', handleClickOutside);
     return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   useEffect(() => {
     if (suggestionsRef.current) {
       playAnimation(suggestionsRef.current, {
         opacity: showSuggestions ? [0, 1] : [1, 0],
         translateY: showSuggestions ? [-5, 0] : [0, -5],
         duration: 200,
         easing: 'easeOutQuad',
         begin: () => { if (showSuggestions && suggestionsRef.current) suggestionsRef.current.style.display = 'block'; },
         complete: () => { if (!showSuggestions && suggestionsRef.current) suggestionsRef.current.style.display = 'none'; },
       });
     }
   }, [showSuggestions, playAnimation]);

  const handleLogout = async () => {
     try {
       await signOutUser();
     } catch (error) {
       console.error("Logout failed in TopBar:", error);
     }
   };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 items-center gap-2 md:gap-4 border-b bg-background/80 px-4 backdrop-blur-lg glass-deep transition-smooth shadow-md md:hidden', // Hidden on md and up
        className
      )}
    >
      <Link href="/" className="flex items-center gap-2 mr-auto transition-smooth group">
        <ShinraAniLogo />
        <span className="font-bold text-lg hidden sm:inline text-foreground group-hover:text-primary transition-colors">Shinra-Ani</span>
      </Link>

      {/* Mobile Search Icon (remains) */}
      <Button variant="ghost" size="icon" className="rounded-full transition-smooth neon-glow-hover" onClick={onSearchIconClick}>
        <SearchIcon className="h-5 w-5" />
        <span className="sr-only">Open Search</span>
      </Button>

      {/* Profile Dropdown / Login Button (remains for mobile) */}
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full transition-smooth neon-glow-hover">
              <Avatar className="h-8 w-8">
                 <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                 <AvatarFallback>{(user.displayName || user.email || 'U').slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-deep animate-fade-in">
            <DropdownMenuLabel>{user.displayName || user.email || 'User Profile'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link href="/login" passHref legacyBehavior>
           <a><Button variant="outline" className="neon-glow-hover transition-smooth text-sm h-9">Login</Button></a>
        </Link>
      )}
    </header>
  );
}
