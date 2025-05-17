'use strict';

/**
 * become-a-speaker router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::become-a-speaker.become-a-speaker');
module.exports = {
    routes: [
      {
        method: 'POST',
        path: '/become-a-speakers',
        handler: 'become-a-speaker.create',
        config: {
          policies: [],
          middlewares: [],
        },
      },
    ],
  };
  