'use strict';

/**
 * newsletter router
 */

module.exports = {
    routes: [
       {
      method: 'GET',
      path: '/newsletters-auth',
      handler: 'newsletter.find',
      config: {
        policies: ['global::api-token-auth'],
      },
    },
      {
        method: 'POST',
        path: '/newsletters',
        handler: 'newsletter.create',
        config: {
          policies: [],
        },
      },
    ],
  };