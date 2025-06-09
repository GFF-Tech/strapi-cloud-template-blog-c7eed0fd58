'use strict';

/**
 * micro-site-home-page router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::micro-site-home-page.micro-site-home-page');
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/micro-site-home-pages',
      handler: 'micro-site-home-page.find',
      config: {
        policies: [],
      },
    },
  ],
};
