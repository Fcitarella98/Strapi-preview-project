'use strict';

/**
 * message controller
 */
const twig = require("twig");
const path = require("path");
const fs = require("fs");

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = {
    async findOne(ctx) {
        try {
            let { id : documentId} = ctx.params;
            console.log("🔍 ID ricevuto:", documentId);
    
            if (!isNaN(documentId)) {
                documentId = Number(documentId);  // Converti in numero se necessario
            }
    
            // Logga tutti i messaggi per verificare se il database li trova
            const allMessages = await strapi.db.query("api::message.message").findMany();
            console.log("📌 Tutti i messaggi nel database:", allMessages);
    
            // Modifica la query per includere le bozze
            const entry = await strapi.db.query("api::message.message").findOne({
         
                where: { documentId },
                populate: {},
                orderBy: { createdAt: "desc" }, // Se hai più versioni dello stesso messaggio, prende l'ultima
            });
    
            if (!entry) {
                console.log("❌ Messaggio non trovato per ID:", documentId);
                return ctx.throw(404, "Messaggio non trovato");
            }
    
            console.log("✅ Messaggio trovato:", entry);
            return entry;
        } catch (error) {
            console.error("❌ Errore nel recupero del messaggio:", error);
            return ctx.throw(500, "Errore interno del server");
        }
    },

    async renderMessage(ctx) {
        try {
            console.log("🔹 Inizio rendering messaggio...");
    
            const entry = await module.exports.findOne(ctx); // ✅ Ora `entry` è già il messaggio
    
            if (!entry) {
                console.log("❌ Nessun messaggio trovato per il rendering.");
                return ctx.throw(404, "Messaggio non trovato");
            }
    
            console.log("✅ Messaggio trovato per il rendering:", entry);
    
            // Percorso assoluto del template Twig
            const templatePath = path.resolve(__dirname, "../templates/message.twig");
            console.log("🔹 Percorso template Twig:", templatePath);
    
            return new Promise((resolve, reject) => {
                twig.renderFile(templatePath, {
                    nome: entry.Nome || "Nome non disponibile",
                    descrizione: entry.Descrizione || "Nessuna descrizione",
                    createdAt: entry.createdAt || new Date(),
                    updatedAt: entry.updatedAt || new Date(),
                }, (err, html) => {
                    if (err) {
                        console.error("❌ Errore nel rendering di Twig:", err);
                        return reject(ctx.throw(500, "Errore nel rendering del template"));
                    }

                    // 🔹 Percorso della cartella dove salvare il file
                    const outputDir = path.resolve(__dirname, "../../../../public/preview");
                    if (!fs.existsSync(outputDir)) {
                        fs.mkdirSync(outputDir, { recursive: true });
                    }

                    // 🔹 Nome del file HTML generato
                    const fileName = `preview_${entry.id}.html`;
                    const filePath = path.join(outputDir, fileName);

                    // 🔹 Scrive il file HTML
                    fs.writeFileSync(filePath, html, "utf8");

                    console.log("✅ File HTML generato:", filePath);

                    // 🔹 Restituisce l'URL pubblico del file
                    
                    ctx.set("Content-Type", "application/json");
                    const publicUrl = `/preview/${fileName}`;
                    ctx.body = { url: publicUrl };

                    resolve();
                });
            });
    
        } catch (error) {
            console.error("❌ Errore nel rendering del messaggio:", error);
            ctx.throw(500, "Errore interno del server");
        }
    }
    
    
};    


