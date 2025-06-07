'use strict';

/**
 * confirmed-speaker service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::confirmed-speaker.confirmed-speaker');
