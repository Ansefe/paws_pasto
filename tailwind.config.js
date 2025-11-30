/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
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
        // ========================================
        // Colores de marca Paws
        // ========================================
        "brand-sky": {
          50: "#e6f7fc",
          100: "#ccf0fa",
          200: "#99e1f5",
          300: "#66d2f0",
          400: "#4FC3F7",  // Color principal
          500: "#29b6f6",
          600: "#03a9f4",
          700: "#0288d1",
          800: "#0277bd",
          900: "#01579b",
          DEFAULT: "#4FC3F7",
        },
        "brand-yellow": {
          50: "#fffef5",
          100: "#fffde6",
          200: "#fff9c4",
          300: "#fff59d",
          400: "#FFF176",  // Color acento
          500: "#ffee58",
          600: "#fdd835",
          700: "#fbc02d",
          800: "#f9a825",
          900: "#f57f17",
          DEFAULT: "#FFF176",
        },
        "brand-mint": {
          50: "#f1f8e9",
          100: "#dcedc8",
          200: "#c5e1a5",
          300: "#AED581",  // Verde menta
          400: "#9ccc65",
          500: "#8bc34a",
          600: "#7cb342",
          700: "#689f38",
          800: "#558b2f",
          900: "#33691e",
          DEFAULT: "#AED581",
        },
        "brand-coral": {
          50: "#ffeef0",
          100: "#ffcdd2",
          200: "#ef9a9a",
          300: "#e57373",
          400: "#FF8A80",  // Coral para alertas amigables
          500: "#f44336",
          DEFAULT: "#FF8A80",
        },
        "brand-cream": {
          50: "#FFFDFB",   // Casi blanco cremoso
          100: "#FFF9F5",  // Fondo alterno
          200: "#FFF3EB",
          DEFAULT: "#FFFDFB",
        },
      },
      fontFamily: {
        // Nunito: Redondeada, amigable y muy legible
        sans: ["Nunito", "Quicksand", "Poppins", "system-ui", "sans-serif"],
        // Alternativa display para títulos
        display: ["Fredoka", "Nunito", "sans-serif"],
      },
      borderRadius: {
        // Bordes generosos para sensación "blanda" y tierna
        lg: "var(--radius)",           // 1rem = 16px
        md: "calc(var(--radius) - 4px)", // 0.75rem = 12px  
        sm: "calc(var(--radius) - 8px)", // 0.5rem = 8px
        xl: "calc(var(--radius) + 4px)", // 1.25rem = 20px
        "2xl": "calc(var(--radius) + 8px)", // 1.5rem = 24px
        "card": "1rem",
        "button": "0.75rem",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
