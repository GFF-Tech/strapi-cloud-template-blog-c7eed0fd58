const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

module.exports = {
  async afterCreate() {
    await redis.del('custom-cache:/api/partners');
  },
  async afterUpdate() {
    await redis.del('custom-cache:/api/partners');
  },
  async afterDelete() {
    await redis.del('custom-cache:/api/partners');
  },
};
