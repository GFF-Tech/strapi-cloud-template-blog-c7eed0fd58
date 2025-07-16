'use strict';

/**
 * delegate router
 */

module.exports = {
  routes: [
    // GET all delegates
    {
      method: 'GET',
      path: '/delegates',
      handler: 'delegate.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    // GET a delegate by ID
    {
      method: 'GET',
      path: '/delegates/:id',
      handler: 'delegate.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    // POST create a delegate
    {
      method: 'POST',
      path: '/delegates',
      handler: 'delegate.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    // PUT update a delegate by ID
    {
      method: 'PUT',
      path: '/delegates/:id',
      handler: 'delegate.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    // DELETE a delegate by ID
    {
      method: 'DELETE',
      path: '/delegates/:id',
      handler: 'delegate.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/delegates/login',
      handler: 'delegate.login',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/delegates/verifyLoginOtp',
      handler: 'delegate.verifyLoginOtp',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/delegates/resendInviteMail',
      handler: 'delegate.resendInviteMail',
      config: {
        policies: [],
        middlewares: [],
      },
    },
      {
      method: 'GET',
      path: '/delegates/getQRCode/:id',
      handler: 'delegate.getQRCode',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
