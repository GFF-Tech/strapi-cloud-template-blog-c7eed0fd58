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
];
// redis cache
const Redis = require('ioredis');

module.exports = ({ env }) => ({
  settings: {
    cache: {
      enabled: true,
      type: 'redis',
      routes: [
        { method: 'GET', path: '/partners', ttl: 300 } // cache /api/partners
      ],
      redisConfig: {
        client: new Redis(env('REDIS_URL')),
      },
    },
  },
});
