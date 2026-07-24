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

const defaultJobOptions = {
    removeOnComplete: {
        count: 100, // keep at most 100 completed jobs
        age: 24 * 3600 // keep completed jobs for max 24 hours
    },
    removeOnFail: {
        count: 500, // keep at most 500 failed jobs
        age: 7 * 24 * 3600 // keep failed jobs for max 7 days
    }
};

const queueOpts = {
    connection: connectionConfig,
    defaultJobOptions
};

module.exports = { 
    sharedConnection: connectionConfig,
    defaultJobOptions,
    queueOpts
};