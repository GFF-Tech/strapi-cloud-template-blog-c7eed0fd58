'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::company-list.company-list', ({ strapi }) => ({
  async bulkCreate(ctx) {
    const names = ctx.request.body;

    if (!Array.isArray(names)) {
      return ctx.badRequest('Payload must be an array of company names (strings)');
    }

    const created = [];

    for (const name of names) {
      if (typeof name === 'string' && name.trim()) {
        const entry = await strapi.entityService.create('api::company-list.company-list', {
          data: { companyName: name.trim() },
        });
        created.push(entry);
      }
    }

    return ctx.send({ count: created.length, data: created });
  }
}));
