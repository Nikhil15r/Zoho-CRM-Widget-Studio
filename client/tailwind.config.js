/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          darkbg: '#18181b',
          darksidebar: '#121214',
          darksurface: '#202024',
          darkborder: '#2e2e32',
          lightbg: '#f8fafc',
          lightsidebar: '#f1f5f9',
          lightsurface: '#ffffff',
          lightborder: '#e2e8f0',
          accent: '#2563eb',
          accentHover: '#1d4ed8',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444'
        }
      }
    },
  },
  plugins: [],
}
