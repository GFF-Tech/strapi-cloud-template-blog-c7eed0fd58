'use strict';

/**
 * confirmed-speaker router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::confirmed-speaker.confirmed-speaker');
module.exports = {
    routes: [
        {
      method: 'GET',
      path: '/confirmed-speakers',
      handler: 'confirmed-speaker.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
      {
        method: 'POST',
        path: '/confirmed-speakers',
        handler: 'confirmed-speaker.create',
        config: {
          policies: [],
          middlewares: [],
        },
      },
    ],
  };
