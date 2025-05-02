'use strict';

/**
 * delegate controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::delegate.delegate', ({ strapi }) => ({
  async find(ctx) {
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    try {
      const result = await strapi.entityService.findOne('api::delegate.delegate', id);

      if (!result) {
        return ctx.notFound('Delegate not found');
      }

      return result;
    } catch (error) {
      console.log(error);
      return ctx.internalServerError('An error occurred while retrieving the delegate');
    }
  },

  async create(ctx) {
    const { data } = ctx.request.body;

    try {
      const createdDelegate = await strapi.entityService.create('api::delegate.delegate', {
        data: {
          ...data,
        },
      });

      return createdDelegate;
    } catch (error) {
      console.error('Creation error:', error);
      return ctx.internalServerError('Failed to create delegate');
    }
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

    if (!id || typeof id !== 'string') {
      return ctx.badRequest('Invalid ID');
    }

    try {
      const existing = await strapi.entityService.findOne('api::delegate.delegate', id);
      if (!existing) {
        return ctx.notFound('Delegate not found');
      }

      await strapi.entityService.update('api::delegate.delegate', id, {
        data: {
          ...data,
        },
      });

      const updated = await strapi.entityService.findOne('api::delegate.delegate', id);
      return updated;

    } catch (error) {
      console.error('Update error:', error);
      return ctx.internalServerError('An error occurred while updating the delegate');
    }
  },

  async delete(ctx) {
    const { id } = ctx.params;

    const deletedDelegate = await strapi.entityService.delete('api::delegate.delegate', id);

    if (!deletedDelegate) {
      return ctx.notFound('Delegate not found');
    }

    return { message: 'Delegate deleted successfully' };
  },
}));
