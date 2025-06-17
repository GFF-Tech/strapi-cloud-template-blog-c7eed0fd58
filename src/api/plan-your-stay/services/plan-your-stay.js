'use strict';

/**
 * plan-your-stay service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::plan-your-stay.plan-your-stay');
