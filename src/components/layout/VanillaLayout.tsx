// src/components/layout/VanillaLayout.tsx
'use client';

import React, { type ReactNode } from 'react';
import TopBar from './TopBar';
import BottomNavigationBar from './BottomNavigationBar';
import { cn } from '@/lib/utils';

interface VanillaLayoutProps {
  children: ReactNode;
  onSearchToggle: (term?: string) => void;
  onAiToggle: () => void;
  isAiSearchActive: boolean;
  onOpenAiSearch: (term: string) => void;
  onOpenAdvancedSearch: (term: string) => void;
  onHyperchargeToggle: () => void;
  isHypercharging: boolean; // Keep prop for potential future use
  currentTheme: string;
}

export default function VanillaLayout({
  children,
  onSearchToggle,
  onAiToggle,
  isAiSearchActive,
  onOpenAiSearch,
  onOpenAdvancedSearch,
  onHyperchargeToggle,
  isHypercharging,
  currentTheme,
}: VanillaLayoutProps) {
  return (
    // Add vanilla-ui-element class for animation targeting
    <div className="flex flex-col h-full vanilla-ui-element">
      <TopBar
        className="vanilla-ui-element" // Add class for potential future animations
        onSearchIconClick={() => onSearchToggle()}
        onSearchSubmit={onSearchToggle} // Simplified: always opens search popup
        onAiToggle={onAiToggle}
        isAiSearchActive={isAiSearchActive}
        onOpenAiSearch={onOpenAiSearch}
        onOpenAdvancedSearch={onOpenAdvancedSearch}
      />

      <div className="flex-1 overflow-y-auto pb-16 vanilla-ui-element scrollbar-thin"> {/* Main content area */}
        <main className="transition-smooth">
          {children}
        </main>
      </div>

      <BottomNavigationBar
        className="vanilla-ui-element" // Add class for potential future animations
        // Pass the theme down to the bottom nav
        currentTheme={currentTheme === 'hypercharged' ? 'hypercharged' : 'vanilla'}
        // Hypercharge toggle is now handled by the floating button in AppLayout
        // onHyperchargeToggle={onHyperchargeToggle}
        // isHypercharging={isHypercharging}
      />
    </div>
  );
}
