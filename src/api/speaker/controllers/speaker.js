'use strict';

/**
 * speaker controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::speaker.speaker', ({ strapi }) => ({

    async find(ctx) {
        try {
          const entities = await strapi.entityService.findMany('api::speaker.speaker', {
            populate: {
              image: {
                fields: ['url'],
              },
              country: {
                fields: ['country'],
              },
            },
            filters: ctx.query.filters,
            sort: ctx.query.sort,
            pagination: ctx.query.pagination,
          });
      
          const count = await strapi.entityService.count('api::speaker.speaker', {
            filters: ctx.query.filters,
          });
      
          return {
            data: entities,
            meta: {
              pagination: {
                total: count,
              },
            },
          };
        } catch (error) {
          console.error('Error fetching speakers:', error);
          return ctx.internalServerError('Failed to fetch speakers');
        }
      },      

}));
