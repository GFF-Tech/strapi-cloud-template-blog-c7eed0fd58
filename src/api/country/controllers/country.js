'use strict';

const { factories } = require('@strapi/strapi');

module.exports = factories.createCoreController('api::country.country', ({ strapi }) => {
  return {
    async find(ctx) {
      const existingFilters = typeof ctx.query?.filters === 'object' && ctx.query?.filters !== null
        ? ctx.query.filters
        : {};

      ctx.query = {
        ...ctx.query,
        filters: {
          ...existingFilters,
          isActive: true,
        },
      };

      const { data, meta } = await super.find(ctx);
      return { data, meta };
    },

    async findOne(ctx) {
      const { id } = ctx.params;
     
      const result = await strapi.db.query('api::country.country').findOne({
        where: { id, isActive: true },
      });

      if (!result) {
        return ctx.notFound('Country not found or inactive');
      }

      return result;
    }
  };
});
