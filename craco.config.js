const daisyui = require('daisyui')

module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
        ...daisyui.postcss
      ],
    },
  },
}
