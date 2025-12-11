/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Lato', 'ui-sans-serif', 'system-ui'],
      logo: ['ui-sans-serif', 'system-ui'],
    },
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          primary: '#2871BC',
          'primary-content': '#d7e7ff',
          secondary: '#18202E',
          'secondary-content': '#ffffff',
          'error-content': '#ffffff',
          'success-content': '#ffffff',
          accent: '#FF7F28',
          neutral: '#1f2937',
          'neutral-focus': '#374151',
          'neutral-content': '#374151',
          'base-100': '#FFFFFF',
          'base-200': '#F4F4F5',
          'base-300': '#dadade',
          info: '#3ABFF8',
          success: '#36D399',
          warning: '#FBAF3A',
          error: '#F87272',
          label: '#323232',
        },
      },
    ],
  },
}
