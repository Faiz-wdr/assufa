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
        
        // Tailwind/Shadcn Standard Fallbacks (Light theme only)
        background: "#FAFAFA",
        foreground: "#111827",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#111827",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#111827",
        },
        muted: {
          DEFAULT: "#FFF1F5",
          foreground: "#6B7280",
        },
        accent: {
          DEFAULT: "#FFF1F5",
          foreground: "#B51D52",
        },
        border: "#E5E7EB",
        input: "#E5E7EB",
        ring: "#B51D52",
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
