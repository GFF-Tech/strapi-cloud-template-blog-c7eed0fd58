'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::facilitator.facilitator', ({ strapi }) => ({

  async find(ctx) {
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    try {
      const result = await strapi.entityService.findOne('api::facilitator.facilitator', id, {
        populate: ['gstDetails'],
      });

      if (!result) {
        return ctx.notFound('Facilitator not found');
      }

      return result;
    } catch (error) {
      console.log(error);
      return ctx.internalServerError('An error occurred while retrieving the facilitator');
    }
  },

  async create(ctx) {
    const { data } = ctx.request.body;

    try {
      const createdFacilitator = await strapi.entityService.create('api::facilitator.facilitator', {
        data: {
          ...data
        },
      });

      return createdFacilitator;
    } catch (error) {
      console.error('Creation error:', error);
      return ctx.internalServerError('Failed to create facilitator');
    }
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

    if (!id || typeof id !== 'string') {
      return ctx.badRequest('Invalid ID');
    }

    try {
      const existing = await strapi.entityService.findOne('api::facilitator.facilitator', id);
      if (!existing) {
        return ctx.notFound('Facilitator not found');
      }

      await strapi.entityService.update('api::facilitator.facilitator', id, {
        data: {
          ...data,
          gstDetails: data.gstDetails ?? null,
        }
      });

      const updated = await strapi.entityService.findOne('api::facilitator.facilitator', id, {
        populate: ['gstDetails'],
      });

      return updated;

    } catch (error) {
      console.error('Update error:', error);
      return ctx.internalServerError('An error occurred while updating the facilitator');
    }
  },

  async delete(ctx) {
    const { id } = ctx.params;

    const deletedFacilitator = await strapi.entityService.delete('api::facilitator.facilitator', id);

    if (!deletedFacilitator) {
      return ctx.notFound('Facilitator not found');
    }

    return { message: 'Facilitator deleted successfully' };
  },

}));
