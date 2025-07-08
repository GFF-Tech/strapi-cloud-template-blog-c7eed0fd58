'use strict';

/**
 * agenda-dd service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::agenda-dd.agenda-dd');
