'use strict';

/**
 * express-interest service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::express-interest.express-interest');
