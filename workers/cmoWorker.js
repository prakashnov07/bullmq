
const { Worker } = require('bullmq');
const axios = require('./utils/optimizedAxios');
const emitResult = require('./utils/emitResult');
const { connectionOptions } = require('./utils/sharedConnection');
const sharedConfig = require('./utils/sharedConfig');
const { devApiUrl, productionApiUrl } = require('./utils/serverUrl');


// Export a function that creates the worker with io instance
exports.createCmoWorker = (io) => {
    return new Worker(
        'getcmo-job',
        async job => {
            if (job.name == 'getcmo') {
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
                        cmo: response.data?.cmo,
                        status: 'completed'
                    }, 'cmo-result');


                } catch (error) {
                    // clearTimeout(timeoutId);
                    console.error('cmo job failed:', error);
                    // Emit error to client

                    emitResult(io, clientSocketId, {
                        jobId,
                        branchid,
                        ptype,
                        error: error.message,
                        status: 'failed'
                    }, 'cmo-error');
                    
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