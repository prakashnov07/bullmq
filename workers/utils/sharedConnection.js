
const IORedis = require('ioredis');
const sharedConnection = new IORedis({
    
    
    
    host: 'localhost', //10.255.255.254
    port: 6379,
    
    // // Timeout configurations
    // connectTimeout: 10000,        // 10 seconds to establish connection
    // commandTimeout: 5000,         // 5 seconds for commands to execute
    // lazyConnect: true,
    
    // // Retry configurations
    // maxRetriesPerRequest: null,      // Changed from null to prevent infinite retries
    // retryDelayOnFailover: 100,
    // retryDelayOnClusterDown: 300,
    
    // // Connection pool settings
    // enableReadyCheck: false,
    // enableOfflineQueue: false,
    // family: 4,
    // keepAlive: true,
    
    // // Performance settings
    // maxmemoryPolicy: 'allkeys-lru',
    
    // // Error handling
    // showFriendlyErrorStack: true



 
    // INCREASED timeout configurations
    connectTimeout: 30000,        // 30 seconds to establish connection
    commandTimeout: 15000,        // 15 seconds for commands (increased from 5)
    lazyConnect: true,
    
    // CRITICAL: Must be null for BullMQ
    maxRetriesPerRequest: null,
    retryDelayOnFailover: 500,    // Increased delay
    retryDelayOnClusterDown: 1000,
    
    // Connection pool settings
    enableReadyCheck: false,
    enableOfflineQueue: false,
    family: 4,
    keepAlive: true,
    
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