'use strict';

/**
 * facilitator service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::facilitator.facilitator');
