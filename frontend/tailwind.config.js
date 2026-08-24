/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        sans: ['Manrope', 'sans-serif'],
      },
      colors: {
        ink: '#1F2937',
        muted: '#4B5563',
        cream: '#FAFAFA',
        line: '#E5E7EB',
        sky: { soft: '#E0F2FE', DEFAULT: '#3B82F6', deep: '#1E3A8A' },
        mint: { DEFAULT: '#10B981', dark: '#059669', soft: '#ECFDF5' },
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0,0,0,0.04)',
        lift: '0 18px 50px rgba(30,58,138,0.10)',
      },
      borderRadius: { '4xl': '2rem' },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        drift: { '0%,100%': { transform: 'translate(0,0)' }, '50%': { transform: 'translate(10px,-18px)' } },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        drift: 'drift 11s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
