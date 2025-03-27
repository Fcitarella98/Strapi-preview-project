module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  // Altre configurazioni dell'admin...
  apiDomain: process.env.REACT_APP_API_DOMAIN || 'http://localhost:1337',
  previewEndpoint: process.env.REACT_APP_PREVIEW_ENDPOINT || '/api/preview/message',
  previewSegment: process.env.REACT_APP_SEGMENT_ENDPOINT || '/api/total-segment',
 
});
