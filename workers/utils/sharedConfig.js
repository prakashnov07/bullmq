
exports.workerConfig = {

            // concurrency: 1,

            concurrency: 1,  // Start with just 1 concurrent job

            // Add delays between job processing
            settings: {
                stalledInterval: 30000,
                maxStalledCount: 1,
                retryProcessDelay: 2000  // 2 second delay between retries
            }

            // Optimize job processing
            //         removeOnComplete: 5,
            //         removeOnFail: 50,
            //         stalledInterval: 30000,
            //         maxStalledCount: 1,
            //         settings: {
            //     backoffStrategy: (attemptsMade) => Math.min(attemptsMade * 2000, 15000)
            // }
  
    }