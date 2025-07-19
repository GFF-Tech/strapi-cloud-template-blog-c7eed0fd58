const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

module.exports = {
  async afterCreate() {
    await redis.del('custom-cache:/api/speakers');
  },
  async afterUpdate() {
    await redis.del('custom-cache:/api/speakers');
  },
  async afterDelete() {
    await redis.del('custom-cache:/api/speakers');
  },
};