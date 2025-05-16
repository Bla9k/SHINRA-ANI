
// src/types/theme.ts

import type { LucideIcon } from 'lucide-react'; // For community icon type, if used in theme previews

export interface CommunityThemeColors {
  background: string; // HSL string, e.g., "220 20% 5%"
  foreground: string; // HSL string
  primary: string; // HSL string
  primaryForeground: string; // HSL string
  secondary: string; // HSL string
  secondaryForeground: string; // HSL string
  accent: string; // HSL string
  accentForeground: string; // HSL string
  destructive: string; // HSL string
  destructiveForeground: string; // HSL string
  card: string; // HSL string
  cardForeground: string; // HSL string
  popover: string; // HSL string
  popoverForeground: string; // HSL string
  border: string; // HSL string
  input: string; // HSL string
  ring: string; // HSL string
}

export interface CommunityThemeBackground {
  type: 'color' | 'image_url' | 'gif_url';
  value: string; // HSL color string or URL
  filePreviewUrl?: string | null; // For local preview of uploaded file
}

export interface CommunityCustomTexts {
  [key: string]: string;
  welcomeMessage?: string;
  communityTagline?: string;
  // Add more specific custom text keys as needed
}

export interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
}

export interface CommunityTheme {
  communityId: string;
  themeName: string;
  colors: CommunityThemeColors;
  background: CommunityThemeBackground;
  customTexts?: CommunityCustomTexts;
  updatedAt?: Date | FirebaseTimestamp;
}


// Default theme values, mirroring a base dark theme for now
export const defaultCommunityTheme: Omit<CommunityTheme, 'communityId' | 'updatedAt'> = {
  themeName: 'Default Community Look',
  colors: {
    background: '220 20% 5%',
    foreground: '210 40% 90%',
    primary: '180 100% 50%', // Neon Cyan
    primaryForeground: '220 20% 10%',
    secondary: '270 60% 70%', // Neon Purple
    secondaryForeground: '210 40% 95%',
    accent: '15 100% 55%', // Fiery Orange-Red
    accentForeground: '0 0% 100%',
    destructive: '0 70% 55%',
    destructiveForeground: '0 0% 98%',
    card: '220 15% 10%',
    cardForeground: '210 40% 88%',
    popover: '220 15% 8%',
    popoverForeground: '210 40% 88%',
    border: '180 50% 30%',
    input: '220 15% 12%',
    ring: '180 100% 55%', // Neon Cyan for rings
  },
  background: {
    type: 'color',
    value: '220 20% 5%', // Default to background color
    filePreviewUrl: null,
  },
  customTexts: {
    welcomeMessage: 'Welcome to our awesome community!',
    communityTagline: 'The place to be for fans!',
  },
};
