'use strict';

/**
 * referral-source service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::referral-source.referral-source');
