'use strict';

/**
 * salutation service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::salutation.salutation');
