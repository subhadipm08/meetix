/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#090b1f",
        violetGlow: "#5b35ff",
        mintGlow: "#14f3a2",
      },
      boxShadow: {
        glow: "0 0 42px rgba(91, 53, 255, 0.32)",
        mint: "0 0 32px rgba(20, 243, 162, 0.22)",
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        pulseGlow: "pulseGlow 2.8s ease-in-out infinite",
        orbit: "orbit 18s linear infinite",
        scan: "scan 2.6s ease-in-out infinite",
        slideUp: "slideUp 0.5s ease-out both",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-18px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.08)" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        scan: {
          "0%, 100%": { transform: "translateX(-24%)", opacity: "0.2" },
          "50%": { transform: "translateX(24%)", opacity: "0.75" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
