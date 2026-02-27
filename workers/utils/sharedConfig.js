exports.workerConfig = {
    concurrency: 20, 
    lockDuration: 120000, 

    // Add delays between job processing
    settings: {
        stalledInterval: 120000,
        maxStalledCount: 3,
        retryProcessDelay: 500  // 0.5 second delay between retries
    },

    removeOnComplete: 100,
    removeOnFail: 200,
}