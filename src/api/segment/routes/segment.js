'use strict';

/**
 * segment router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
    routes: [
      {
        method: 'POST',
        path: '/total-segment',
        handler: 'segment.totalSegment',
        config: {
          auth: false, // Imposta true se vuoi proteggere l'endpoint
        },
      },
    ],
  };
