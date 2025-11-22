
const { Worker } = require('bullmq');
const axios = require('axios');
const sharedConnection = require('./utils/sharedConnection').sharedConnection;
const sharedConfig = require('./utils/sharedConfig');
const { devUrl, productionUrl } = require('./utils/serverUrl');


// Export a function that creates the worker with io instance
exports.createPullPolicyWorker = (io) => {
    return new Worker(
        'pull-policy-job',
        async job => {
            if (job.name == 'pull-policy') {
                const branchid = job.data.branchid;
                const ptype = job.data.ptype;
                const jobId = job.id;
                const clientSocketId = job.data.clientSocketId;

                // Add job processing timeout
                const timeoutId = setTimeout(() => {
                    console.warn(`Job ${job.id} is taking too long, potential stall`);
                }, 30000); // 30 seconds

                try {
                    const response = await axios.post(`${devUrl}/cron_jobs/RunPullPolicyBullMq.php`, {
                        branchid, ptype, name: job.name
                    }, 
                    { timeout: 15000 , // 15 seconds timeout for the request
                        
                            headers: {
                                'content-type': 'application/json',
                                'authorization': 'Bearer ' + job.data.token
                            }
                        }
                    );

                    clearTimeout(timeoutId);

                    console.log('Policy data received:', response.data.policy);

                    // Now you can use the io instance properly
                    if (clientSocketId) {
                        // Send to specific client
                        io.to(clientSocketId).emit('policy-result', {
                            jobId,
                            branchid,
                            ptype,
                            policy: response.data.policy,
                            status: 'completed'
                        });
                    } else {
                        // Broadcast to all connected clients
                        io.emit('policy-result', {
                            jobId,
                            branchid,
                            ptype,
                            policy: response.data.policy,
                            status: 'completed'
                        });
                    }

                    return response.data.policy;

                } catch (error) {
                    clearTimeout(timeoutId);
                    console.error('Policy job failed:', error);

                    // Emit error to client
                    if (clientSocketId) {
                        io.to(clientSocketId).emit('policy-error', {
                            jobId,
                            branchid,
                            ptype,
                            error: error.message,
                            status: 'failed'
                        });
                    } else {
                        io.emit('policy-error', {
                            jobId,
                            branchid,
                            ptype,
                            error: error.message,
                            status: 'failed'
                        });
                    }

                    throw error;
                }
            }
        },
        {
            connection: sharedConnection,
           ...sharedConfig.workerConfig,
        }
    );
};