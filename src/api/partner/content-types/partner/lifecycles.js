module.exports = {
  async afterCreate(event) {
    strapi.middleware.cache.clear('/partners');
  },
  async afterUpdate(event) {
    strapi.middleware.cache.clear('/partners');
  },
  async afterDelete(event) {
    strapi.middleware.cache.clear('/partners');
  }
};