/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'muaythai-blue': '#3B82F6',
        'muaythai-blue-dark': '#2563EB',
        'muaythai-red': '#EF4444',
        'muaythai-red-dark': '#DC2626',
      }
    },
  },
  plugins: [],
}