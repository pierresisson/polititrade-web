// PolitiTrades Design System
// Centralized design tokens for consistent styling

export const colors = {
  background: {
    base: "#FAF7F0",
    surface: "#FFFCF6",
    white: "#FFFFFF",
  },
  text: {
    primary: "#1F1E1A",
    secondary: "#6B6A63",
  },
  brand: {
    indigo: "#4F46E5",
    violet: "#7C3AED",
  },
  accent: {
    amber: "#F59E0B",
    amberLight: "#FEF3C7",
  },
  border: {
    subtle: "#E8E5DD",
  },
  chart: {
    1: "#4F46E5",
    2: "#7C3AED",
    3: "#06B6D4",
    4: "#F59E0B",
    5: "#10B981",
  },
  status: {
    success: "#10B981",
    successLight: "#D1FAE5",
    error: "#EF4444",
    errorLight: "#FEE2E2",
  },
} as const;

export const typography = {
  fontFamily: {
    display: "var(--font-fraunces)",
    body: "var(--font-inter)",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
  },
} as const;

export const spacing = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
} as const;

export const shadows = {
  card: "0 1px 3px 0 rgba(31, 30, 26, 0.04), 0 1px 2px 0 rgba(31, 30, 26, 0.02)",
  cardHover: "0 4px 6px -1px rgba(31, 30, 26, 0.06), 0 2px 4px -1px rgba(31, 30, 26, 0.04)",
  elevated: "0 10px 15px -3px rgba(31, 30, 26, 0.08), 0 4px 6px -2px rgba(31, 30, 26, 0.04)",
} as const;

export const radius = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.5rem",
  full: "9999px",
} as const;

export const transitions = {
  fast: "150ms ease",
  normal: "200ms ease",
  slow: "300ms ease",
} as const;
