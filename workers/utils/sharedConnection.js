const IORedis = require('ioredis');
const sharedConnection = new IORedis({
    
    host: 'localhost', //10.255.255.254
    port: 6379,
    
    maxRetriesPerRequest: null,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxLoadingTimeout: 1,
    
    // Connection pooling
    lazyConnect: true,
    keepAlive: 30000,
    
    //  for server Performance optimizations
    // connectTimeout: 10000,
    // commandTimeout: 5000,

     // for local
    connectTimeout: 30000,
    commandTimeout: 15000,
    
    // Cluster mode if using Redis Cluster
    // enableOfflineQueue: false,
    
    // Performance settings
    maxmemoryPolicy: 'allkeys-lru',
    
    // Error handling
    showFriendlyErrorStack: true
});

// Connection event handlers
sharedConnection.on('connect', () => {
    console.log('Redis connected successfully');
});

sharedConnection.on('error', (err) => {
    console.error('Redis connection error:', err.message);
});

sharedConnection.on('close', () => {
    console.log('Redis connection closed');
});

sharedConnection.on('reconnecting', () => {
    console.log('Redis reconnecting...');
});

module.exports = { sharedConnection };