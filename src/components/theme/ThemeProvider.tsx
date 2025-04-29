"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Set default theme to 'dark' and disable system preference detection
  return (
    <NextThemesProvider
      attribute="class" // Use class-based theming
      defaultTheme="dark"
      enableSystem={false} // Disable system preference detection
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
