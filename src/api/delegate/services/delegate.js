'use strict';

/**
 * delegate service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::delegate.delegate');
