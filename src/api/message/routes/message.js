'use strict';

/**
 * message router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;
module.exports = {
    routes: [
      {
        method: "GET",
        path: "/preview/message/:id",
        handler: "message.renderMessage",
        config: {
          policies: [],
          middlewares: [],
        },
      }, 
      {
        method: "POST",
        path: "/messages/:id",
        handler: "message.findOne",
        config: {
          policies: [],
          middlewares: [],
        },
      },
    ],
  };
  