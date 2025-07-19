const path = require('path'); // ✅ Required for path.resolve()

module.exports = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',

  // ✅ Custom Redis Cache Middleware
  {
    resolve: path.resolve(__dirname, '../src/middlewares/cache'),
    config: {},
  },
];
