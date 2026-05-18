"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface ColorSettings {
  primaryColor: string
  accentColor: string
  showDoodle: boolean
  compactMode: boolean
}

interface ColorContextType {
  colors: ColorSettings
  setColors: (colors: Partial<ColorSettings>) => void
  resetColors: () => void
}

const defaultColors: ColorSettings = {
  primaryColor: "#1e3a8a",
  accentColor: "#d97706",
  showDoodle: true,
  compactMode: false,
}

const ColorContext = createContext<ColorContextType | undefined>(undefined)

function hexToOklch(hex: string): string {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  // Convert RGB to linear RGB
  const toLinear = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  const lr = toLinear(r)
  const lg = toLinear(g)
  const lb = toLinear(b)

  // Convert to XYZ
  const x = 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb
  const y = 0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb
  const z = 0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb

  // Convert to OKLab
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z)
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z)
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z)

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
  const bVal = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_

  // Convert to OKLCH
  const C = Math.sqrt(a * a + bVal * bVal)
  let H = Math.atan2(bVal, a) * 180 / Math.PI
  if (H < 0) H += 360

  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`
}

function generateColorVariants(hex: string, isDark: boolean) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  // Create lighter version for backgrounds
  const lightenAmount = isDark ? 0.15 : 0.85
  const lr = Math.round(r + (255 - r) * lightenAmount)
  const lg = Math.round(g + (255 - g) * lightenAmount)
  const lb = Math.round(b + (255 - b) * lightenAmount)
  const lightHex = `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`

  // Create darker version for text
  const darkenAmount = isDark ? 0.7 : 0.3
  const dr = Math.round(r * darkenAmount)
  const dg = Math.round(g * darkenAmount)
  const db = Math.round(b * darkenAmount)
  const darkHex = `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`

  return {
    main: hexToOklch(hex),
    light: hexToOklch(lightHex),
    dark: hexToOklch(darkHex),
  }
}

export function ColorProvider({ children }: { children: ReactNode }) {
  const [colors, setColorsState] = useState<ColorSettings>(defaultColors)
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("color-settings")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setColorsState({ ...defaultColors, ...parsed })
      } catch {
        // ignore
      }
    }
    setMounted(true)
  }, [])

  // Apply CSS variables whenever colors change
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    const isDark = root.classList.contains("dark")

    const primaryVariants = generateColorVariants(colors.primaryColor, isDark)
    const accentVariants = generateColorVariants(colors.accentColor, isDark)

    // Set primary color
    root.style.setProperty("--primary", primaryVariants.main)
    root.style.setProperty("--primary-foreground", isDark ? "oklch(0.13 0 0)" : "oklch(0.98 0 0)")
    root.style.setProperty("--ring", primaryVariants.main)

    // Set accent color  
    root.style.setProperty("--accent", accentVariants.light)
    root.style.setProperty("--accent-foreground", isDark ? "oklch(0.95 0 0)" : "oklch(0.15 0.01 260)")

    // Set sidebar primary
    root.style.setProperty("--sidebar-primary", primaryVariants.main)
    root.style.setProperty("--sidebar-ring", primaryVariants.main)

    // Set chart colors
    root.style.setProperty("--chart-1", primaryVariants.main)
    root.style.setProperty("--chart-2", accentVariants.main)

    // Compact mode
    if (colors.compactMode) {
      root.style.setProperty("--radius", "0.25rem")
      root.classList.add("compact-mode")
    } else {
      root.style.setProperty("--radius", "0.5rem")
      root.classList.remove("compact-mode")
    }

    // Doodle mode
    if (colors.showDoodle) {
      root.classList.add("show-doodle")
    } else {
      root.classList.remove("show-doodle")
    }

  }, [colors, mounted])

  // Watch for theme changes
  useEffect(() => {
    if (!mounted) return

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          // Re-apply colors when theme changes
          const isDark = document.documentElement.classList.contains("dark")
          const primaryVariants = generateColorVariants(colors.primaryColor, isDark)
          const accentVariants = generateColorVariants(colors.accentColor, isDark)
          
          document.documentElement.style.setProperty("--primary", primaryVariants.main)
          document.documentElement.style.setProperty("--ring", primaryVariants.main)
          document.documentElement.style.setProperty("--accent", accentVariants.light)
          document.documentElement.style.setProperty("--sidebar-primary", primaryVariants.main)
          document.documentElement.style.setProperty("--sidebar-ring", primaryVariants.main)
          document.documentElement.style.setProperty("--chart-1", primaryVariants.main)
          document.documentElement.style.setProperty("--chart-2", accentVariants.main)
        }
      })
    })

    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [colors, mounted])

  const setColors = (newColors: Partial<ColorSettings>) => {
    setColorsState(prev => {
      const updated = { ...prev, ...newColors }
      localStorage.setItem("color-settings", JSON.stringify(updated))
      return updated
    })
  }

  const resetColors = () => {
    setColorsState(defaultColors)
    localStorage.setItem("color-settings", JSON.stringify(defaultColors))
  }

  return (
    <ColorContext.Provider value={{ colors, setColors, resetColors }}>
      {children}
    </ColorContext.Provider>
  )
}

export function useColors() {
  const context = useContext(ColorContext)
  if (!context) {
    throw new Error("useColors must be used within a ColorProvider")
  }
  return context
}
