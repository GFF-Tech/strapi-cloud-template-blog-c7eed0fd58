'use strict';

/**
 * plan-your-stay router
 */

module.exports = {
    routes: [
       {
      method: 'GET',
      path: '/plan-your-stays-auth',
      handler: 'plan-your-stay.find',
      config: {
        policies: ['global::api-token-auth'],
      },
    },
      {
        method: 'POST',
        path: '/plan-your-stays',
        handler: 'plan-your-stay.create',
        config: {
          policies: [],
        },
      },
    ],
  };
