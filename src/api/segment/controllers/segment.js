'use strict';
const axios = require('axios');
/**
 * segment controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = {
    async totalSegment(ctx) {
        try {
            // Recupera i dati inviati dal front end
            const requestData = ctx.request.body;
            console.log("Dati ricevuti dal front end:", requestData);

            // URL dell'API esterna
            const externalApiUrl = 'http://localhost:3000/data';

            // Effettua la chiamata all'API esterna
            const externalResponse =  await axios.get(externalApiUrl, requestData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            console.log("Risposta dall'API esterna:", externalResponse.data);

            // Supponiamo che l'API esterna restituisca un intero in externalResponse.data
            const result = externalResponse.data;

            
            const count = Array.isArray(result) ? result.length : 0;
            console.log("Numero di elementi:", count);
            // Invia il risultato al front end
            ctx.send({ count });
        } catch (error) {
            console.error("Errore durante la chiamata all'API esterna:", error);
            ctx.throw(500, error);
        }
    },
};
