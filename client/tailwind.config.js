module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', // blue-600
          dark: '#1e40af',   // blue-800
        },
        secondary: {
          DEFAULT: '#f59e42', // orange-400
        },
        background: {
          light: '#f9fafb', // gray-50
          dark: '#18181b',  // zinc-900
        },
        surface: {
          light: '#fff',
          dark: '#27272a',
        },
      },
    },
  },
  plugins: [],
}; 