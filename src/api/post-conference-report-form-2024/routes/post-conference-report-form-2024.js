'use strict';

/**
 * post-conference-report-form-2024 router
 */

module.exports = {
    routes: [
       {
      method: 'GET',
      path: '/post-conference-report-forms-2024-auth',
      handler: 'post-conference-report-form-2024.find',
      config: {
        policies: ['global::api-token-auth'],
      },
    },
      {
        method: 'POST',
        path: '/post-conference-report-forms-2024',
        handler: 'post-conference-report-form-2024.create',
        config: {
          policies: [],
        },
      },
    ],
  };