const IORedis = require('ioredis');

const connectionConfig = {
    host: 'localhost', //10.255.255.254
    port: 6379,
    
    maxRetriesPerRequest: null,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxLoadingTimeout: 1,
    
    // Connection pooling
    lazyConnect: true,
    keepAlive: 30000,
    
    // for local
    connectTimeout: 30000,
    commandTimeout: 15000,
    
    // Performance settings
    maxmemoryPolicy: 'allkeys-lru',
    
    // Error handling
    showFriendlyErrorStack: true
};

module.exports = { sharedConnection: connectionConfig };