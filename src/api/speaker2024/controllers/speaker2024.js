'use strict';

/**
 * speaker2024 controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::speaker2024.speaker2024');
module.exports = createCoreController('api::speaker2024.speaker2024', ({ strapi }) => ({
  async find(ctx) {
    const response = await strapi.entityService.findMany('api::speaker2024.speaker2024', {
      populate: {
        profilePhoto: true,
        },
    });

    return { data: response };
  },
}));
