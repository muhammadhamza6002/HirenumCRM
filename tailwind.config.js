/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#1AC9C4",
          hover: "#22D3CB",
          muted: "#19A8A4",
        },
        pink: {
          DEFAULT: "#E8158E",
          hover: "#FF2E9E",
          muted: "#B81270",
        },
        bg: {
          dark: "#0A0A0A",
          card: "#161616",
          hover: "#1F1F1F",
          input: "#0F0F0F",
        },
        ink: "#FFFFFF",
        muted: "#9CA3AF",
        accent: "#1AC9C4",
        border: "#262626",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "Poppins", "Sora", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        pill: "999px",
        card: "16px",
      },
      boxShadow: {
        "teal-glow": "0 0 24px rgba(26, 201, 196, 0.25)",
        "pink-glow": "0 0 24px rgba(232, 21, 142, 0.30)",
      },
    },
  },
  plugins: [],
};
