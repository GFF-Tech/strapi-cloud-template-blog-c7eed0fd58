'use strict';

module.exports = {
  routes: [
    // GET all facilitators
    {
      method: 'GET',
      path: '/facilitators',
      handler: 'facilitator.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    // GET a facilitator by ID
    {
      method: 'GET',
      path: '/facilitators/:id',
      handler: 'facilitator.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    // POST create a facilitator
    {
      method: 'POST',
      path: '/facilitators',
      handler: 'facilitator.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    {
      method: 'POST',
      path: '/facilitators/verify',
      handler: 'facilitator.verifyFacilitator',
      config: {
        policies: [],
        middlewares: [],
      }
    },

    // PUT update a facilitator by ID
    {
      method: 'PUT',
      path: '/facilitators/:id',
      handler: 'facilitator.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    // DELETE a facilitator by ID
    {
      method: 'DELETE',
      path: '/facilitators/:id',
      handler: 'facilitator.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
