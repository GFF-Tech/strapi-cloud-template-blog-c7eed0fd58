'use strict';

const { factories } = require('@strapi/strapi');

module.exports = factories.createCoreController('api::sector.sector', ({ strapi }) => {
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
     
      const result = await strapi.db.query('api::sector.sector').findOne({
        where: { id, isActive: true },
      });

      if (!result) {
        return ctx.notFound('sector not found or inactive');
      }

      return result;
    }
  };
});

