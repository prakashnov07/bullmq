
const { Worker } = require('bullmq');
const axios = require('axios');
const sharedConnection = require('./utils/sharedConnection').sharedConnection;
const sharedConfig = require('./utils/sharedConfig');
const { devApiUrl, productionApiUrl } = require('./utils/serverUrl');


// Export a function that creates the worker with io instance
exports.createHomeWorkWorker = (io) => {
    return new Worker(
        'fetch-home-work-job',
        async job => {
            if (job.name == 'viewhomeworkself') {
                const jobId = job.id;
                const name = job.name;
                const {branchid, owner, enrid, role, utype, medium, token, ptype, clientSocketId} = job.data;

                // Add job processing timeout
                const timeoutId = setTimeout(() => {
                    console.warn(`Job ${job.id} is taking too long, potential stall`);
                }, 40000); // 40 seconds

                try {
                    const response = await axios.get(`${productionApiUrl}/${job.name}`, {
                        params: {branchid, owner, enrid, role, utype, medium, token, ptype, clientSocketId},
                        timeout: 40000 , // 40 seconds timeout for the request
                        
                            headers: {
                                'content-type': 'application/json',
                                'Authorization': 'Bearer ' + token
                            }
                        }
                    );

                    clearTimeout(timeoutId);

                    console.log('home work data received:', response.data?.rows);

                    // Now you can use the io instance properly
                    if (clientSocketId) {
                        // Send to specific client
                        io.to(clientSocketId).emit('homework-result', {
                            jobId,
                            branchid,
                            ptype,
                            rows: response.data?.rows,
                            status: 'completed'
                        });
                    } else {
                        // Broadcast to all connected clients
                        io.emit('homework-result', {
                            jobId,
                            branchid,
                            ptype,
                            rows: response.data?.rows,
                            status: 'completed'
                        });
                    }

                    return response.data?.rows;

                } catch (error) {
                    clearTimeout(timeoutId);
                    console.error('homework job failed:', error);

                    // Emit error to client
                    if (clientSocketId) {
                        io.to(clientSocketId).emit('homework-error', {
                            jobId,
                            branchid,
                            ptype,
                            error: error.message,
                            status: 'failed'
                        });
                    } else {
                        io.emit('homework-error', {
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