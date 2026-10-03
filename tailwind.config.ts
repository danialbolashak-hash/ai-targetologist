import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
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
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        neon: {
          blue: "#06B6D4",
          purple: "#7C3AED",
          green: "#10B981",
        },
        brand: {
          purple: "#7C3AED",
          "purple-light": "#A78BFA",
          cyan: "#06B6D4",
          "cyan-light": "#22D3EE",
          gold: "#CA8A04",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "neon-glow": "linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)",
        "dark-gradient": "linear-gradient(180deg, #0B0B14 0%, #12121F 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(6,182,212,0.05) 100%)",
      },
      boxShadow: {
        "neon-sm": "0 0 16px rgba(124, 58, 237, 0.30)",
        "neon-md": "0 0 28px rgba(124, 58, 237, 0.38)",
        "neon-lg": "0 0 56px rgba(124, 58, 237, 0.45)",
        "card": "0 8px 32px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-neon": "pulseNeon 2s infinite",
        "shimmer": "shimmer 2s linear infinite",
        "aurora": "aurora 18s ease-in-out infinite",
        "aurora-slow": "aurora 28s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "marquee": "marquee 40s linear infinite",
        "marquee-rev": "marqueeRev 40s linear infinite",
        "gradient-x": "gradientX 6s ease infinite",
        "spin-slow": "spin 14s linear infinite",
        "border-spin": "borderSpin 4s linear infinite",
        "grid-pan": "gridPan 30s linear infinite",
        "glow-breathe": "glowBreathe 4s ease-in-out infinite",
        "scan": "scan 3s ease-in-out infinite",
        "count-up": "fadeIn 0.8s ease-out",
        "tilt": "tilt 10s infinite linear",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseNeon: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(0,212,255,0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(0,212,255,0.7)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        aurora: {
          "0%, 100%": { transform: "translate(0,0) scale(1)", opacity: "0.5" },
          "33%": { transform: "translate(8%,-6%) scale(1.15)", opacity: "0.7" },
          "66%": { transform: "translate(-6%,8%) scale(0.95)", opacity: "0.4" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        marqueeRev: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        borderSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        gridPan: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "60px 60px" },
        },
        glowBreathe: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
        tilt: {
          "0%, 50%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(0.5deg)" },
          "75%": { transform: "rotate(-0.5deg)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
