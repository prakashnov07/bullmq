// Create axios instance with connection pooling
const axios = require('axios');
const https = require('https');
const http = require('http');

const optimizedAxios = axios.create({
    timeout: 5000, // Reduced from 40 seconds
    maxRedirects: 2,
    
    // Connection pooling
    httpAgent: new http.Agent({
        keepAlive: true,
        maxSockets: 100,
        maxFreeSockets: 10,
        timeout: 5000,
    }),
    
    httpsAgent: new https.Agent({
        keepAlive: true,
        maxSockets: 100,
        maxFreeSockets: 10,
        timeout: 5000,
    })
});

module.exports = optimizedAxios;