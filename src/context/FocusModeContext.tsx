import React, { createContext, useState, useContext, type ReactNode, useCallback } from 'react';
import type { DisplayItem } from '@/app/page'; // Assuming DisplayItem is defined here or in a shared types file

interface FocusModeContextProps {
  isFocusModeActive: boolean;
  focusedItem: DisplayItem | null;
  engageFocusMode: (item: DisplayItem) => void;
  exitFocusMode: () => void;
}

const FocusModeContext = createContext<FocusModeContextProps | undefined>(undefined);

export const FocusModeProvider = ({ children }: { children: ReactNode }) => {
  const [isFocusModeActive, setIsFocusModeActive] = useState(false);
  const [focusedItem, setFocusedItem] = useState<DisplayItem | null>(null);

  const engageFocusMode = useCallback((item: DisplayItem) => {
    setFocusedItem(item);
    setIsFocusModeActive(true);
  }, []);

  const exitFocusMode = useCallback(() => {
    setIsFocusModeActive(false);
    // Optional: Clear the item after a short delay if you want exit animation to show the item
    // setTimeout(() => setFocusedItem(null), 300); // Adjust delay as needed
     setFocusedItem(null); // Clear immediately
  }, []);

  return (
    <FocusModeContext.Provider value={{ isFocusModeActive, focusedItem, engageFocusMode, exitFocusMode }}>
      {children}
    </FocusModeContext.Provider>
  );
};

export const useFocusMode = () => {
  const context = useContext(FocusModeContext);
  if (context === undefined) {
    throw new Error('useFocusMode must be used within a FocusModeProvider');
  }
  return context;
};
