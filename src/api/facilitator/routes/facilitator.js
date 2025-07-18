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
    {
      method: 'POST',
      path: '/facilitators/verifyCopy',
      handler: 'facilitator.verifyFacilitatorCopy',
      config: {
        policies: [],
        middlewares: [],
      }
    },

    {
      method: 'POST',
      path: '/facilitators/resendOtp',
      handler: 'facilitator.resendFacilitatorOtp',
      config: {
        policies: [],
        middlewares: [],
      },
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

    {
      method: 'PUT',
      path: '/facilitators/updateProfile/:id',
      handler: 'facilitator.updateProfile',
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
    {
      method: 'POST',
      path: '/facilitators/login',
      handler: 'facilitator.login',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/facilitators/verifyLoginOtp',
      handler: 'facilitator.verifyLoginOtp',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/facilitators/delegateToFacilitator',
      handler: 'facilitator.delegateToFacilitator',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/facilitators/getMyPass/:id',
      handler: 'facilitator.getMyPass',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // {
    //   method: 'POST',
    //   path: '/facilitators/wooOrderSync',
    //   handler: 'facilitator.wooOrderSync',
    //   config: {
    //     policies: [],
    //     middlewares: [],
    //     auth: false
    //   },
    // },
  ],
};
