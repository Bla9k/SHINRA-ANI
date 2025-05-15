
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme" // Use data-theme attribute
      defaultTheme="dark" // Keep dark as the default
      enableSystem={false} // Disable system preference detection
      // No explicit 'themes' prop needed when using attribute strategy with arbitrary values
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
