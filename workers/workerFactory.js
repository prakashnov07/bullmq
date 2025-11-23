// workers/workerFactory.js
const { createPullPolicyWorker } = require('./pullPolicyWorker');
const { createHomeWorkWorker } = require('./homeWorkWorker');
const { createErpFeeWorker } = require('./erpFeeWorker');
// const { createBulkAttendanceWorker } = require('./bulkAttendanceWorker');
// const { createFeeReminderWorker } = require('./feeReminderWorker');
// const { createMessageWorker } = require('./messageWorker');

const workerFactories = {
    'pull-policy': createPullPolicyWorker,
    'homework': createHomeWorkWorker,
    'erp-fee': createErpFeeWorker,
    // 'bulk-attendance': createBulkAttendanceWorker,
    // 'fee-reminder': createFeeReminderWorker,
    // 'message': createMessageWorker
};

const createAllWorkers = (io, workerCount = 1) => {
    const workers = [];
    
    Object.entries(workerFactories).forEach(([workerType, createWorker]) => {
        for (let i = 0; i < workerCount; i++) {
            try {
                const worker = createWorker(io);
                
                // Add common error handling
                worker.on('error', (err) => {
                    console.error(`${workerType} Worker ${i} error:`, err.message);
                });
                
                worker.on('failed', (job, err) => {
                    console.error(`${workerType} Job ${job.id} failed on worker ${i}:`, err.message);
                });
                
                worker.on('stalled', (jobId) => {
                    console.warn(`${workerType} Job ${jobId} stalled on worker ${i}`);
                });
                
                worker.on('completed', (job) => {
                    console.log(`${workerType} Job ${job.id} completed on worker ${i}`);
                });
                
                workers.push({
                    type: workerType,
                    instance: worker,
                    id: i
                });
                
                console.log(`Created ${workerType} worker ${i}`);
                
            } catch (error) {
                console.error(`Failed to create ${workerType} worker ${i}:`, error.message);
            }
        };
    });
    
    return workers;
};

module.exports = { createAllWorkers, workerFactories };