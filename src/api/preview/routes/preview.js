module.exports = {
    routes: [
      {
        method: "POST",
        path: "/preview",
        handler: "preview.index",
        config: {
          auth: false, // Rendi accessibile il webhook senza autenticazione
        },
      },
    ],
  };
  