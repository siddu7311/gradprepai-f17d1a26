import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",
        "glass-bg": "hsl(var(--glass-bg))",
        "glass-border": "hsl(var(--glass-border))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--secondary) / 0.1))',
        'glow-gradient': 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
        'card-gradient': 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px hsl(var(--primary) / 0.3)',
        'glow': '0 0 20px hsl(var(--primary) / 0.3), 0 0 40px hsl(var(--primary) / 0.2)',
        'glow-lg': '0 0 30px hsl(var(--primary) / 0.4), 0 0 60px hsl(var(--primary) / 0.2), 0 0 90px hsl(var(--primary) / 0.1)',
        'glow-secondary': '0 0 20px hsl(var(--secondary) / 0.3), 0 0 40px hsl(var(--secondary) / 0.2)',
        'inner-glow': 'inset 0 0 20px hsl(var(--primary) / 0.1)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-left": {
          from: { opacity: "0", transform: "translateX(-40px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in-right": {
          from: { opacity: "0", transform: "translateX(40px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "scale-in-center": {
          from: { opacity: "0", transform: "scale(0.5)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-top": {
          from: { transform: "translateY(-100%)" },
          to: { transform: "translateY(0)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "pulse-scale": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 20px hsl(var(--primary) / 0.3), 0 0 40px hsl(var(--primary) / 0.2)" 
          },
          "50%": { 
            boxShadow: "0 0 30px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--primary) / 0.3)" 
          },
        },
        "border-rotate": {
          from: { "--angle": "0deg" },
          to: { "--angle": "360deg" },
        },
        "shimmer": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(100%)" },
        },
        "blob": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "25%": { transform: "translate(20px, -30px) scale(1.1)" },
          "50%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "75%": { transform: "translate(30px, 10px) scale(1.05)" },
        },
        "wave": {
          "0%": { transform: "rotate(0.0deg)" },
          "10%": { transform: "rotate(14deg)" },
          "20%": { transform: "rotate(-8deg)" },
          "30%": { transform: "rotate(14deg)" },
          "40%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(10.0deg)" },
          "60%": { transform: "rotate(0.0deg)" },
          "100%": { transform: "rotate(0.0deg)" },
        },
        "morph": {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
        },
        "typing": {
          from: { width: "0" },
          to: { width: "100%" },
        },
        "blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        "fade-in-down": "fade-in-down 0.6s ease-out forwards",
        "fade-in-left": "fade-in-left 0.6s ease-out forwards",
        "fade-in-right": "fade-in-right 0.6s ease-out forwards",
        "scale-in": "scale-in 0.5s ease-out forwards",
        "scale-in-center": "scale-in-center 0.5s ease-out forwards",
        "slide-in-bottom": "slide-in-bottom 0.5s ease-out forwards",
        "slide-in-top": "slide-in-top 0.5s ease-out forwards",
        "spin-slow": "spin-slow 20s linear infinite",
        "pulse-scale": "pulse-scale 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
        "blob": "blob 8s ease-in-out infinite",
        "wave": "wave 2.5s ease-in-out infinite",
        "morph": "morph 8s ease-in-out infinite",
        "typing": "typing 3.5s steps(40, end)",
        "blink": "blink 1s step-end infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
