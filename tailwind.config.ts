import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        "display-lg": ["4.5rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "display-xl": ["6rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
      },
      colors: {
        border: "hsl(var(--border))",
        "border-subtle": "hsl(var(--border-subtle))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          muted: "hsl(var(--primary-muted))",
          glow: "hsl(var(--primary-glow))",
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
          muted: "hsl(var(--accent-muted))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          elevated: "hsl(var(--card-elevated))",
          hover: "hsl(var(--card-hover))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Trading-specific colors
        profit: {
          DEFAULT: "hsl(var(--profit))",
          foreground: "hsl(var(--profit-foreground))",
          muted: "hsl(var(--profit-muted))",
        },
        loss: {
          DEFAULT: "hsl(var(--loss))",
          foreground: "hsl(var(--loss-foreground))",
          muted: "hsl(var(--loss-muted))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        // Aurora gradient colors
        aurora: {
          green: "hsl(var(--aurora-green))",
          teal: "hsl(var(--aurora-teal))",
          cyan: "hsl(var(--aurora-cyan))",
          blue: "hsl(var(--aurora-blue))",
          red: "hsl(var(--aurora-red))",
          orange: "hsl(var(--aurora-orange))",
          pink: "hsl(var(--aurora-pink))",
        },
        // Level colors
        level: {
          bronze: "hsl(var(--level-bronze))",
          silver: "hsl(var(--level-silver))",
          gold: "hsl(var(--level-gold))",
          platinum: "hsl(var(--level-platinum))",
          diamond: "hsl(var(--level-diamond))",
        },
        // Chart colors
        chart: {
          grid: "hsl(var(--chart-grid))",
          crosshair: "hsl(var(--chart-crosshair))",
          volume: "hsl(var(--chart-volume))",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius)",
        sm: "calc(var(--radius) - 4px)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        "glow-sm": "0 0 15px hsl(var(--primary) / 0.2)",
        "glow": "0 0 20px hsl(var(--primary) / 0.25), 0 0 40px hsl(var(--primary) / 0.15)",
        "glow-lg": "0 0 30px hsl(var(--primary) / 0.3), 0 0 60px hsl(var(--primary) / 0.2)",
        "glow-profit": "0 0 15px hsl(var(--profit) / 0.3), 0 0 30px hsl(var(--profit) / 0.15)",
        "glow-loss": "0 0 15px hsl(var(--loss) / 0.3), 0 0 30px hsl(var(--loss) / 0.15)",
        "inner-glow": "inset 0 1px 0 hsl(0 0% 100% / 0.1)",
        "elevated": "0 8px 24px hsl(0 0% 0% / 0.4), 0 4px 8px hsl(0 0% 0% / 0.3)",
        "card": "0 4px 16px hsl(0 0% 0% / 0.3)",
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
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 20px hsl(var(--primary) / 0.3)"
          },
          "50%": {
            opacity: "0.85",
            boxShadow: "0 0 40px hsl(var(--primary) / 0.5)"
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "number-tick": {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-100%)" },
          "50.01%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(var(--primary) / 0.2), 0 0 40px hsl(var(--primary) / 0.1)"
          },
          "50%": {
            boxShadow: "0 0 30px hsl(var(--primary) / 0.4), 0 0 60px hsl(var(--primary) / 0.2)"
          },
        },
        "border-glow": {
          "0%, 100%": {
            borderColor: "hsl(var(--border))"
          },
          "50%": {
            borderColor: "hsl(var(--primary) / 0.5)"
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "float": "float 4s ease-in-out infinite",
        "slide-up": "slide-up 0.6s ease-out",
        "slide-down": "slide-down 0.6s ease-out",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "scale-in": "scale-in 0.4s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "number-tick": "number-tick 0.3s ease-out",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "border-glow": "border-glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-mesh": "radial-gradient(at 40% 20%, hsl(var(--aurora-cyan) / 0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsl(var(--aurora-blue) / 0.2) 0px, transparent 50%)",
      },
      backdropBlur: {
        "premium": "20px",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
