module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      textColor: {
        DEFAULT: '#ffffff', // Default text color for dark theme
      },
      colors: {
        primary: {
          DEFAULT: '#D60B20', // main red
          dark: '#a50919',   // hover
          darker: '#840714', // active
          contrast: '#fff',
        },
        success: {
          DEFAULT: '#77B300',
          dark: '#558000',
          darker: '#3d5c00',
          contrast: '#fff',
        },
        info: {
          DEFAULT: '#9933CC',
          dark: '#7a29a3',
          contrast: '#fff',
        },
        warning: {
          DEFAULT: '#FF8800',
          dark: '#cc6d00',
          contrast: '#fff',
        },
        danger: {
          DEFAULT: '#CC0000',
          dark: '#990000',
          contrast: '#fff',
        },
        neutral: {
          900: '#282828', // border, dark
          800: '#333333', // panel bg
          700: '#424242', // btn-default
          400: '#AAAAAA', // body text
          100: '#fff',    // white
        },
      },
    },
  },
  plugins: [],
}; 