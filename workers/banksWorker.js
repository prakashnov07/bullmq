
const { Worker } = require('bullmq');
const axios = require('./utils/optimizedAxios');
const emitResult = require('./utils/emitResult');
const sharedConnection = require('./utils/sharedConnection').sharedConnection;
const sharedConfig = require('./utils/sharedConfig');
const { devApiUrl, productionApiUrl } = require('./utils/serverUrl');


// Export a function that creates the worker with io instance
exports.createBanksWorker = (io) => {
    return new Worker(
        'fetch-public-banks-job',
        async job => {
            if (job.name == 'fetchpublicbanks') {
                const jobId = job.id;
                const name = job.name;
                const { branchid, owner, enrid, role, utype, medium, token, ptype, clientSocketId, id } = job.data;

                try {
                    const response = await axios.get(`${productionApiUrl}/${job.name}`, {
                        params: { branchid, owner, enrid, role, utype, medium, token, ptype, clientSocketId, id },
                        // timeout: 40000, // 40 seconds timeout for the request

                        headers: {
                            'content-type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        }
                    }
                    );

                    emitResult(io, clientSocketId, {
                        jobId,
                        branchid,
                        ptype,
                        lastMessageId: id,
                        banks: response.data?.banks,
                        status: 'completed'
                    }, 'banks-result');


                } catch (error) {
                    // clearTimeout(timeoutId);
                    console.error('banks job failed:', error);
                    // Emit error to client

                    emitResult(io, clientSocketId, {
                        jobId,
                        branchid,
                        ptype,
                        error: error.message,
                        status: 'failed'
                    }, 'banks-error');
                    
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