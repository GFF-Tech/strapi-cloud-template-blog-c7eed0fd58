'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/company-lists/bulk',
      handler: 'company-list.bulkCreate',
      config: {
        policies: [],
        middlewares: [],
      },
    },
     {
      method: 'GET',
      path: '/company-lists',
      handler: 'company-list.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
