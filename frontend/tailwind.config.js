export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#1f2933',
        muted: '#65717f',
        line: '#e6e8eb',
        soft: '#f6f4ef',
        coral: '#e9584f',
        forest: '#1f6f5b',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(31, 41, 51, 0.08)',
      },
    },
  },
  plugins: [],
};
