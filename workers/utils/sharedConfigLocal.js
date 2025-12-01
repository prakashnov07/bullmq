
exports.workerConfig = {

            concurrency: 1, //for local


            // Add delays between job processing
            settings: {
                stalledInterval: 30000,
                maxStalledCount: 1,
                retryProcessDelay: 2000  // 2 second delay between retries
            },

           removeOnComplete: 100,
           removeOnFail: 200,
  
    }