'use strict';

const { factories } = require('@strapi/strapi');

module.exports = factories.createCoreRouter('api::country.country', {
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
      path: '/countries',
      handler: 'country.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/countries/:id',
      handler: 'country.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
});
