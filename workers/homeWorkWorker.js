
const { Worker } = require('bullmq');
const axios = require('axios');
const emitResult = require('./utils/emitResult');
const { connectionOptions } = require('./utils/sharedConnection');
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
                const { branchid, owner, enrid, role, utype, medium, token, ptype, clientSocketId, reportdate } = job.data;

                // Add job processing timeout
                // const timeoutId = setTimeout(() => {
                //     console.warn(`Job ${job.id} is taking too long, potential stall`);
                // }, 40000); // 40 seconds

                try {
                    const response = await axios.get(`${productionApiUrl}/${job.name}`, {
                        params: { branchid, owner, enrid, role, utype, medium, token, ptype, clientSocketId, reportdate },
                        // timeout: 40000 , // 40 seconds timeout for the request

                        headers: {
                            'content-type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        }
                    }
                    );

                    // clearTimeout(timeoutId);

                    // console.log('home work data received:', response.data?.rows);

                    emitResult(io, clientSocketId, {
                        jobId,
                        branchid,
                        ptype,
                        rows: response.data?.rows,
                        reportdate,
                        enrid,
                        status: 'completed'
                    }, 'homework-result');

                    // return response.data?.rows;

                } catch (error) {
                    // clearTimeout(timeoutId);
                    console.error('homework job failed:', error);

                    emitResult(io, clientSocketId, {
                        jobId,
                        branchid,
                        ptype,
                        error: error.message,
                        status: 'failed'
                    }, 'homework-error');

                    throw error;
                }
            }
        },
        {
            connection: connectionOptions,
            ...sharedConfig.workerConfig,
        }
    );
};