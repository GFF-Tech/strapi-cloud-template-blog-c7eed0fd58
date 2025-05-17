'use strict';

/**
 * become-a-speaker service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::become-a-speaker.become-a-speaker');
