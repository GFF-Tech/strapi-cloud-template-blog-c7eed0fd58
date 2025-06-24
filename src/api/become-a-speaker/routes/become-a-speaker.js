'use strict';

/**
 * become-a-speaker router
 */
module.exports = {
    routes: [
       {
      method: 'GET',
      path: '/become-a-speakers-auth',
      handler: 'become-a-speaker.find',
      config: {
        policies: ['global::api-token-auth'],
      },
    },
      {
        method: 'POST',
        path: '/become-a-speakers',
        handler: 'become-a-speaker.create',
        config: {
          policies: [],
        },
      },
    ],
  };
  