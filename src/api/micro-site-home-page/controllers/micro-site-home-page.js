'use strict';

/**
 * micro-site-home-page controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::micro-site-home-page.micro-site-home-page', ({ strapi }) => ({
  async find(ctx) {
    const response = await strapi.entityService.findMany('api::micro-site-home-page.micro-site-home-page', {
      populate: {
        logoSection: {
          populate: {
            logos: {
                populate: ['webImage','mobileImage']
            }
          } 
        },
      },
    });

    return { data: response };
  },
}));
