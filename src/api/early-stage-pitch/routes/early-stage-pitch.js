'use strict';

/**
 * early-stage-pitch router
 */

module.exports = {
    routes: [
       {
      method: 'GET',
      path: '/early-stage-pitches-auth',
      handler: 'early-stage-pitch.find',
      config: {
        policies: ['global::api-token-auth'],
      },
    },
      {
        method: 'POST',
        path: '/early-stage-pitches',
        handler: 'early-stage-pitch.create',
        config: {
          policies: [],
        },
      },
    ],
  };