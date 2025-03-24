module.exports = {
    async index(ctx) {
      const { entry } = ctx.request.body;
  
      if (!entry) {
        return ctx.badRequest("Nessun contenuto ricevuto");
      }
  
      console.log("Ricevuto contenuto per preview:", entry);
  
      return ctx.send({ message: "Preview aggiornata", entry });
    },
  };