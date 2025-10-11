/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#16A34A", // اللون الأخضر الأساسي (زر واتساب)
          secondary: "#E6F2EF",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#E5E7EB", // الرمادي الفاتح للعناصر الثانوية
          foreground: "#111827",
        },
        accent: {
          DEFAULT: "#FCD34D", // لون النجوم (ذهبي)
        },
        muted: "#F9FAFB", // خلفية خفيفة
        border: "#E5E7EB",
        text: {
          DEFAULT: "#111827", // نص أساسي
          light: "#6B7280",   // نص ثانوي
        },
        background: "#FFFFFF",
      },
      fontFamily: {
        sans: ["Cairo", "Tajawal", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "12px",
        lg: "20px",
        xl: "28px",
        "2xl": "32px",
      },
      boxShadow: {
        card: "0 2px 10px rgba(0, 0, 0, 0.05)",
        button: "0 2px 6px rgba(0, 0, 0, 0.1)",
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwindcss-animate"),
  ],
};
