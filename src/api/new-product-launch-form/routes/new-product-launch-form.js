'use strict';

module.exports = {
    routes: [
       {
      method: 'GET',
      path: '/new-product-launch-forms-auth',
      handler: 'new-product-launch-form.find',
      config: {
        policies: ['global::api-token-auth'],
      },
    },
      {
        method: 'POST',
        path: '/new-product-launch-forms',
        handler: 'new-product-launch-form.create',
        config: {
          policies: [],
        },
      },
    ],
  };