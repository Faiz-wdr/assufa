import tailwindAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
      },
      colors: {
        // Design System Colors
        primary: {
          DEFAULT: "#B51D52",
          hover: "#9A1845",
          light: "#FCDEE9",
          soft: "#FFF1F5",
        },
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",
        info: "#0891B2",
        neutral: {
          bg: "#FAFAFA",
          surface: "#FFFFFF",
          border: "#E5E7EB",
          textPrimary: "#111827",
          textSecondary: "#6B7280",
          disabled: "#D1D5DB",
        },

        // Dark theme semantic overrides via CSS vars
        surface: "var(--surface)",
        'surface-raised': "var(--surface-raised)",
        'bg-page': "var(--bg-page)",
        'text-primary-css': "var(--text-primary)",
        'text-secondary-css': "var(--text-secondary)",
        'border-color-css': "var(--border-color)",
        'header-bg': "var(--header-bg)",
        'nav-bg': "var(--nav-bg)",
        'input-bg': "var(--input-bg)",
        'settings-row': "var(--settings-row-bg)",
        'settings-row-hover': "var(--settings-row-hover)",

        // Tailwind/Shadcn Standard Fallbacks
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        card: "14px",
        btn: "10px",
        input: "8px",
        sheet: "20px",
        badge: "999px",
        // Shadcn UI base mappings
        lg: "14px",
        md: "10px",
        sm: "8px",
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(0, 0, 0, 0.02), 0 1px 4px rgba(0, 0, 0, 0.01)',
        'lifted': '0 8px 24px -4px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.01)',
        'sheet': '0 -10px 30px -5px rgba(0, 0, 0, 0.04)',
        'dark-soft': '0 2px 12px rgba(0, 0, 0, 0.15), 0 1px 4px rgba(0, 0, 0, 0.08)',
        'dark-sheet': '0 -10px 30px -5px rgba(0, 0, 0, 0.3)',
      },
      fontSize: {
        'display': ['36px', { lineHeight: '44px', fontWeight: '800' }],
        'h1': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'h3': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'body': ['15px', { lineHeight: '22px', fontWeight: '400' }],
        'small': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
    },
  },
  plugins: [tailwindAnimate],
};
