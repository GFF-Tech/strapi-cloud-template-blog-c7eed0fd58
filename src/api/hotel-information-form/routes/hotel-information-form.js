'use strict';

module.exports = {
    routes: [
       {
      method: 'GET',
      path: '/hotel-information-forms-auth',
      handler: 'hotel-information-form.find',
      config: {
        policies: ['global::api-token-auth'],
      },
    },
      {
        method: 'POST',
        path: '/hotel-information-forms',
        handler: 'hotel-information-form.create',
        config: {
          policies: [],
        },
      },
    ],
  };
