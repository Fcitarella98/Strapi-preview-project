module.exports = ({ env }) => ({
    apiDomain: process.env.REACT_APP_API_DOMAIN || 'http://localhost:1337',
    previewEndpoint: process.env.REACT_APP_PREVIEW_ENDPOINT || '/api/preview/message',
    previewSegment: process.env.REACT_APP_SEGMENT_ENDPOINT || '/api/total-segment',
   
});