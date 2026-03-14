exports.workerConfig = {
    concurrency: 20,

    // Lock must be held for the entire job duration.
    // BullMQ renews the lock every lockDuration/2, so set this well above
    // the longest expected job (PHP endpoint). 5 minutes should be safe.
    lockDuration: 300000, // 5 minutes

    // stalledInterval MUST be greater than lockDuration, otherwise BullMQ
    // marks the job as stalled before the lock renewal can fire → double execution.
    // In BullMQ v5, these are top-level Worker options.
    stalledInterval: 360000,  // 6 minutes (> lockDuration)
    maxStalledCount: 0,       // 0 = do NOT re-queue on stall; fail cleanly instead
    
    settings: {
        retryProcessDelay: 500
    },

    removeOnComplete: 100,
    removeOnFail: 200,
}