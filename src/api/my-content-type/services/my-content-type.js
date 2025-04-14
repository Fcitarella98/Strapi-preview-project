'use strict';

/**
 * my-content-type service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::my-content-type.my-content-type');
