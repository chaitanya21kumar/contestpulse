/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    container: { padding: { DEFAULT: "15px" } },

    screens: { sm: "640px", md: "768px", lg: "960px", xl: "1200px" },

    extend: {
      /* Core palette */
      colors: {
        primary   : "#0d0d0d",   // charcoal black
        secondary : "#393A47",
        accent    : "#F13024",
        glowStart : "#14b869",   // emerald highlight
      },

      backgroundImage: {
        explosion : 'url("/bg-explosion.png")',
        circles   : 'url("/bg-circles.png")',
        circleStar: 'url("/circle-star.svg")',
        site      : 'url("/site-bg.svg")',
      },

      animation: { "spin-slow": "spin 6s linear infinite" },

      fontFamily: {
        poppins: [`var(--font-poppins)`, "sans-serif"],
        sora   : [`var(--font-sora)`,    "sans-serif"],
      },
    },
  },

  plugins: [require("tailwind-scrollbar")],
};
