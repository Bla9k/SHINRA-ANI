// src/components/layout/Footer.tsx
import React from 'react';
import { cn } from '@/lib/utils';

export default function Footer() {
  return (
    <footer className={cn(
        "text-center py-6 sm:py-8 mt-8 md:mt-12 border-t border-border/50 text-xs text-muted-foreground",
        "px-4" // Ensure padding matches content area
        )}
        >
      <p className="mb-1">© 2025 Weebs With a Pen Inc. | All Rights Reserved</p>
      <p className="mb-1">Made by ™Weebs With a Pen — For the Culture</p>
      <p className="mb-1">Version 1.0 – HyperFlash Protocol</p>
      <p>Contact us at: <a href="mailto:weebswithapen365@gmail.com" className="text-primary hover:underline">weebswithapen365@gmail.com</a></p>
    </footer>
  );
}
