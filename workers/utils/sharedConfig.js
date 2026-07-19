exports.workerConfig = {
    concurrency: 10,

    // Lock must be held for the entire job duration.
    // BullMQ renews the lock every lockDuration/2, so set this well above
    // the longest expected job (PHP endpoint). 10 minutes is safer under high load.
    lockDuration: 600000, // 10 minutes

    // stalledInterval MUST be greater than lockDuration, otherwise BullMQ
    // marks the job as stalled before the lock renewal can fire → double execution.
    // In BullMQ v5, these are top-level Worker options.
    stalledInterval: 660000,  // 11 minutes (> lockDuration)
    maxStalledCount: 2,       // Allow up to 2 stalls (e.g. process restarts) before failing
    
    settings: {
        retryProcessDelay: 500
    },

    removeOnComplete: 100,
    removeOnFail: 200,
}