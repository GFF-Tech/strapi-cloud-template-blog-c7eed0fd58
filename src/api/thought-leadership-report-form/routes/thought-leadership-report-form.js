'use strict';

module.exports = {
    routes: [
       {
      method: 'GET',
      path: '/thought-leadership-report-forms-auth',
      handler: 'thought-leadership-report-form.find',
      config: {
        policies: ['global::api-token-auth'],
      },
    },
      {
        method: 'POST',
        path: '/thought-leadership-report-forms',
        handler: 'thought-leadership-report-form.create',
        config: {
          policies: [],
        },
      },
    ],
  };