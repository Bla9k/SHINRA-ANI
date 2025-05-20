
// src/context/LayoutActionsContext.tsx
'use client';

import React, { createContext, useContext, type ReactNode } from 'react';

interface LayoutActionsContextType {
  openCustomizeModal: () => void;
  openSubscriptionModal: () => void;
}

const LayoutActionsContext = createContext<LayoutActionsContextType | undefined>(undefined);

export const LayoutActionsProvider = ({ children, actions }: { children: ReactNode; actions: LayoutActionsContextType }) => {
  return (
    <LayoutActionsContext.Provider value={actions}>
      {children}
    </LayoutActionsContext.Provider>
  );
};

export const useLayoutActions = (): LayoutActionsContextType => {
  const context = useContext(LayoutActionsContext);
  if (context === undefined) {
    throw new Error('useLayoutActions must be used within a LayoutActionsProvider');
  }
  return context;
};
