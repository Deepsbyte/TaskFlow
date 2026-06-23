/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          base: "#0f1117",
          sidebar: "#161b27",
          card: "#1c2333",
          elevated: "#242b3d",
        },
        slate: {
          400: "#94a3b8", // secondary text
          700: "#2d3748", // border
        },
        indigo: {
          500: "#6366f1", // primary accent
        },
        cyan: {
          500: "#06b6d4", // secondary accent
        },
      },
      transitionDuration: {
        '150': '150ms',
      }
    },
  },
  plugins: [],
}