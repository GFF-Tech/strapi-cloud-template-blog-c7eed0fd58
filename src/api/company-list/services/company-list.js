'use strict';

/**
 * company-list service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::company-list.company-list');
