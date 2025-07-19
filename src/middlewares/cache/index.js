const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

const CACHE_TTL = 300; // in seconds
const CACHE_ROUTES = [
  '/api/partners',
  '/api/speakers',
]; // customize as needed

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    if (ctx.method !== 'GET') return next();

    const path = ctx.request.path;
    if (!CACHE_ROUTES.includes(path)) return next();

    const key = `custom-cache:${path}`;
    const cached = await redis.get(key);

    if (cached) {
      ctx.set('X-Cache', 'HIT');
      ctx.body = JSON.parse(cached);
      return;
    }

    await next();

    if (ctx.status === 200 && ctx.body) {
      redis.set(key, JSON.stringify(ctx.body), 'EX', CACHE_TTL);
      ctx.set('X-Cache', 'MISS');
    }
  };
};
