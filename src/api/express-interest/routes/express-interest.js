'use strict';

/**
 * express-interest router
 */
module.exports = {
    routes: [
       {
      method: 'GET',
      path: '/express-interests-auth',
      handler: 'express-interest.find',
      config: {
        policies: ['global::api-token-auth'],
      },
    },
      {
        method: 'POST',
        path: '/express-interests',
        handler: 'express-interest.create',
        config: {
          policies: [],
        },
      },
    ],
  };