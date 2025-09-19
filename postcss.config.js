/*/ website/postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {
      config: '../tailwind.base.config.ts'
    },
    autoprefixer: {}
  }
}
*/

// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},  // Tailwind v4 PostCSS plugin
    autoprefixer: {},
  },
};
