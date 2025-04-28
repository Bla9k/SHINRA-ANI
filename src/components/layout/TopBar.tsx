
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Sparkles, Search as SearchIcon, Settings } from 'lucide-react';
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

interface TopBarProps {
  onSearchIconClick: () => void;
  onSearchSubmit: (term: string) => void;
  onAiToggle: () => void;
  isAiSearchActive: boolean;
  onOpenAiSearch: (term: string) => void;
  onOpenAdvancedSearch: (term: string) => void;
  className?: string; // Add className prop
}

export default function TopBar({
    onSearchIconClick,
    onSearchSubmit,
    onAiToggle,
    isAiSearchActive,
    onOpenAiSearch,
    onOpenAdvancedSearch,
    className // Destructure className
}: TopBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const isAuthenticated = true; // Placeholder
  const user = {
    username: 'ShinraUser',
    avatarUrl: 'https://picsum.photos/40/40?random=1',
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    setShowSuggestions(!!term.trim());
  };

  const handleSearchFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowSuggestions(false);
    if (searchTerm.trim()) {
      onSearchSubmit(searchTerm.trim());
    } else {
      onSearchIconClick();
    }
  };

  const handleAiSuggestionClick = () => {
      if (searchTerm.trim()) {
          onOpenAiSearch(searchTerm.trim());
          setShowSuggestions(false);
          setSearchTerm('');
      }
  };

  const handleAdvancedSuggestionClick = () => {
      if (searchTerm.trim()) {
          onOpenAdvancedSearch(searchTerm.trim());
          setShowSuggestions(false);
          setSearchTerm('');
      }
  };

  React.useEffect(() => {
    if (!debouncedSearchTerm) {
      setShowSuggestions(false);
    }
  }, [debouncedSearchTerm]);

  const handleFocus = () => {
      if (searchTerm.trim()) {
          setShowSuggestions(true);
      }
  };

  const handleBlur = () => {
      setTimeout(() => setShowSuggestions(false), 150);
  };

  return (
    // Apply className prop here
    <header className={cn(
        "sticky top-0 z-40 flex h-16 items-center gap-2 md:gap-4 border-b bg-background/80 px-4 backdrop-blur-md glass transition-smooth",
        className // Apply the passed className
    )}>
      <Link href="/" className="flex items-center gap-2 mr-auto transition-smooth">
         <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary transition-smooth">
            <path d="M50 0L61.226 30.9017H95.1056L69.9398 50L81.1658 80.9017H50L18.8342 80.9017L30.0602 50L4.89435 30.9017H38.774L50 0Z" fill="currentColor"/>
         </svg>
        <span className="font-bold text-lg hidden sm:inline">Shinra-Ani</span>
      </Link>

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
                className="absolute top-full left-0 mt-1.5 w-full z-10 bg-background/80 backdrop-blur-sm rounded shadow-md border border-border/50 overflow-hidden animate-fade-in"
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

      <div className="flex items-center gap-2">
         <Button variant="ghost" size="icon" className="rounded-full md:hidden transition-smooth neon-glow-hover">
           <SearchIcon className="h-5 w-5" />
           <span className="sr-only">Open Search</span>
         </Button>

        <Button
           variant="ghost"
           size="icon"
           className={cn(
             "rounded-full neon-glow-hover transition-smooth",
             isAiSearchActive && "bg-primary/20 text-primary neon-glow"
           )}
           onClick={onAiToggle}
           aria-pressed={isAiSearchActive}
           aria-label={isAiSearchActive ? "Deactivate AI Search Mode" : "Activate AI Search Mode"}
        >
          <Sparkles className="h-5 w-5" />
          <span className="sr-only">{isAiSearchActive ? "Deactivate AI Search Mode" : "Activate AI Search Mode"}</span>
        </Button>

        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full transition-smooth neon-glow-hover">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                  <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                 <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass animate-fade-in">
              <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                 <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login" passHref legacyBehavior>
            <Button variant="outline" className="neon-glow-hover transition-smooth">Login</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
