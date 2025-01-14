/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontSize: {
      sm: "12px",
      base: "14px",
      xl: "16px",
      "2xl": "20px",
      "2.5xl":"24px",
      "3xl": "28px",
      "4xl": "35px",
      "5xl": "50px",
    },

    extend: {
      colors: {
        white: "#FFFFFF",
        black: "#242424",
        grey: "#F3F3F3",
        "dark-grey": "#6B6B6B",
        transparent: "transparent",
      },
    },
  },
  plugins: [],
};
