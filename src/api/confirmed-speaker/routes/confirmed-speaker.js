'use strict';

/**
 * confirmed-speaker router
 */

module.exports = {
    routes: [
       {
      method: 'GET',
      path: '/confirmed-speakers-auth',
      handler: 'confirmed-speaker.find',
      config: {
        policies: ['global::api-token-auth'],
      },
    },
      {
        method: 'POST',
        path: '/confirmed-speakers',
        handler: 'confirmed-speaker.create',
        config: {
          policies: [],
        },
      },
    ],
  };