'use strict';

/**
 * sector router
 */

const { factories } = require('@strapi/strapi');

module.exports = factories.createCoreRouter('api::sector.sector', {
  config: {
    find: {
      policies: [],
      middlewares: [],
    },
    findOne: {
      policies: [],
      middlewares: [],
    },
  },
  routes: [
    {
      method: 'GET',
      path: '/sectors',
      handler: 'sector.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/sectors/:id',
      handler: 'sector.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
});

