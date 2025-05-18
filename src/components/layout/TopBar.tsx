// src/components/layout/TopBar.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
    Search as SearchIcon, Settings, X, Menu as MenuIcon, LogOut, User as UserIconLucide,
    Home as HomeIcon, Tv, BookText, Users as UsersIcon, Palette, Star, PlusCircle, ShieldCheck,
    Flame, Zap, Rocket, Moon, Sun, Gift, ChevronRight
} from 'lucide-react'; // Added Gift and ChevronRight
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';
import type { NavSection } from './BottomNavigationBar'; // Import NavSection type
import { useRouter } from 'next/navigation'; // Import useRouter

interface TopBarProps {
  onSearchIconClick: () => void;
  navSections: NavSection[]; // Add this prop
  onOpenSubscriptionModal: () => void;
  onOpenCreateCommunityModal: () => void;
  handleLogout: () => void;
  className?: string;
}

const ShinraAniLogo = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-primary transition-transform duration-300 hover:scale-110 group-hover:rotate-[15deg]"
  >
    <path
      d="M50 0 L65 20 L85 15 L75 40 L95 50 L75 60 L85 85 L65 80 L50 100 L35 80 L15 85 L25 60 L5 50 L25 40 L15 15 L35 20 Z"
      fill="currentColor"
      stroke="hsl(var(--card-foreground))"
      strokeWidth="2.5"
      transform="rotate(15 50 50)"
      className="group-hover:filter group-hover:drop-shadow-[0_0_3px_hsl(var(--primary))]"
    />
    <circle cx="50" cy="50" r="12" fill="hsl(var(--background))" />
    <path d="M50 40 L55 50 L50 60 L45 50 Z" fill="currentColor"/>
  </svg>
);


export default function TopBar({
  onSearchIconClick,
  navSections,
  onOpenSubscriptionModal,
  onOpenCreateCommunityModal,
  handleLogout,
  className,
}: TopBarProps) {
  const { user, loading: authLoading, userProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter(); // For navigation from dropdown

  const renderDropdownMenuItems = (isMobileMenu: boolean = false) => {
    const mainNavItems = navSections.filter(s => s.mainHref && !s.subItems && !s.isDirectAction && s.id !== 'profile' && s.id !== 'customize' && s.id !== 'search-action' && s.id !== 'create-community-action');
    const profileSection = navSections.find(s => s.id === 'profile');
    const customizeSection = navSections.find(s => s.id === 'customize');
    const createCommunitySection = navSections.find(s => s.id === 'create-community-action');

    return (
      <>
        {isMobileMenu && mainNavItems.map(section => (
          <DropdownMenuItem key={`mobile-${section.id}`} asChild>
            <Link href={section.mainHref!} className="flex items-center gap-2 w-full">
              <section.icon size={16}/>{section.label}
            </Link>
          </DropdownMenuItem>
        ))}
        {isMobileMenu && mainNavItems.length > 0 && <DropdownMenuSeparator />}

        {user && profileSection && profileSection.subItems && (
          profileSection.subItems.map(subItem => {
            if (subItem.href) {
              return (
                <DropdownMenuItem key={subItem.id} asChild>
                  <Link href={subItem.href} className="flex items-center gap-2 w-full">
                    <subItem.icon size={16} /> {subItem.label}
                  </Link>
                </DropdownMenuItem>
              );
            } else if (subItem.action) {
              return (
                <DropdownMenuItem key={subItem.id} onClick={subItem.action} className={cn("flex items-center gap-2 w-full", subItem.id === 'profile-logout' && "text-destructive focus:text-destructive-foreground focus:bg-destructive/90")}>
                  <subItem.icon size={16} /> {subItem.label}
                </DropdownMenuItem>
              );
            }
            return null;
          })
        )}

        {customizeSection && customizeSection.subItems && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 w-full">
              <customizeSection.icon size={16} />{customizeSection.label}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="glass-deep">
                {customizeSection.subItems.map(subItem => (
                  <DropdownMenuItem key={subItem.id} onClick={subItem.action} className="flex items-center gap-2">
                    <subItem.icon size={16} className={theme === subItem.id.replace('theme-', '') ? 'text-primary' : ''}/> {subItem.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        )}
        
        {user && createCommunitySection && (
          <DropdownMenuItem onClick={createCommunitySection.directAction} className="flex items-center gap-2 w-full">
            <createCommunitySection.icon size={16} />{createCommunitySection.label}
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        {user ? null : ( // Logout is in profileSection, this is for Login
          <DropdownMenuItem asChild>
            <Link href="/login" className="flex items-center gap-2 w-full">Login / Sign Up</Link>
          </DropdownMenuItem>
        )}
      </>
    );
  };


  if (theme === 'hypercharge-netflix') {
    return (
      <header className={cn(
        'sticky top-0 z-30 flex h-16 items-center justify-between gap-2 md:gap-4 border-b px-4 transition-smooth shadow-md',
        'bg-card text-card-foreground border-border/50',
        className
      )}>
        {/* Left side: Logo/Name as Dropdown Trigger */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 p-2 -ml-2 group">
              <ShinraAniLogo />
              <span className="font-bold text-lg text-primary group-hover:text-primary/80 transition-colors hidden sm:inline">Shinra-Ani</span>
              <MenuIcon size={20} className="sm:hidden text-primary"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="glass-deep w-64" sideOffset={10}>
            {renderDropdownMenuItems(true)}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Right side: Search and Profile */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={onSearchIconClick}>
            <SearchIcon className="h-5 w-5 text-foreground/80 hover:text-foreground" />
            <span className="sr-only">Search</span>
          </Button>
           {/* Profile Avatar for desktop, moved into hamburger on mobile within Netflix theme */}
           {authLoading ? (
            <Skeleton className="h-9 w-9 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hidden sm:flex">
                  <Avatar className="h-8 w-8 border border-primary/30">
                     <AvatarImage src={userProfile?.avatarUrl || user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                     <AvatarFallback>{(user.displayName || user.email || 'U').slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-deep w-64">
                <DropdownMenuLabel className="truncate">{userProfile?.username || user.displayName || user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                {renderDropdownMenuItems(false)}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <Link href="/login" passHref legacyBehavior>
                <a className="hidden sm:inline-block"><Button variant="outline" className="text-sm h-9 px-3">Login</Button></a>
             </Link>
          )}
        </div>
      </header>
    );
  }

  // Default TopBar for other themes (mobile-only)
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center gap-2 md:gap-4 border-b px-4 backdrop-blur-lg transition-smooth shadow-md',
        'bg-background/80 border-border/50 glass-deep',
        'md:hidden',
        className
      )}
    >
      <Link href="/" className="flex items-center gap-2 mr-auto transition-smooth group">
        <ShinraAniLogo />
        <span className="font-bold text-lg hidden sm:inline text-foreground group-hover:text-primary transition-colors">Shinra-Ani</span>
      </Link>

      <Button variant="ghost" size="icon" className="rounded-full transition-smooth neon-glow-hover h-10 w-10" onClick={onSearchIconClick}>
        <SearchIcon className="h-5 w-5" />
        <span className="sr-only">Open Search</span>
      </Button>

      {authLoading ? (
        <Skeleton className="h-9 w-9 rounded-full" />
      ) : user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full transition-smooth neon-glow-hover h-10 w-10">
              <Avatar className="h-8 w-8 border border-primary/50">
                 <AvatarImage src={userProfile?.avatarUrl || user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                 <AvatarFallback>{(user.displayName || user.email || 'U').slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-deep w-56 animate-fade-in">
            <DropdownMenuLabel className="truncate">{userProfile?.username || user.displayName || user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/profile" className="flex items-center gap-2"><UserIconLucide size={14}/> Profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/settings" className="flex items-center gap-2"><Settings size={14}/> Settings</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-destructive focus:text-destructive-foreground focus:bg-destructive/90">
                <LogOut size={14}/> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link href="/login" passHref legacyBehavior>
           <a><Button variant="outline" className="neon-glow-hover transition-smooth text-sm h-9 px-3">Login</Button></a>
        </Link>
      )}
    </header>
  );
}
