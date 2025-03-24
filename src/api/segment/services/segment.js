'use strict';

/**
 * segment service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::segment.segment');
