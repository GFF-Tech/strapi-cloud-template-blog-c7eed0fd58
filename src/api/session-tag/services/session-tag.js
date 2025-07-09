'use strict';

/**
 * session-tag service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::session-tag.session-tag');
