const { Worker } = require('bullmq');
const axios = require('axios');
const emitResult = require('./utils/emitResult');
const { sharedConnection } = require('./utils/sharedConnection');
const sharedConfig = require('./utils/sharedConfig');
const { devApiUrl, productionApiUrl } = require('./utils/serverUrl');

exports.createResultDetailsWorker = (io) => {
    return new Worker(
        'getallresultdetails-job',
        async job => {
            if (job.name == 'getallresultdetails') {
                const jobId = job.id;
                const { branchid, enrid, clientSocketId, ptype, token, role, utype, owner, medium } = job.data;

                try {
                    const response = await axios.get(`${productionApiUrl}/${job.name}`, {
                        params: { branchid, enrid, role, utype, owner, medium },
                        headers: {
                            'content-type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        }
                    });

                    emitResult(io, clientSocketId, {
                        jobId, branchid, ptype, enrid,
                        rows: response.data?.rows,
                        prows: response.data?.prows,
                        status: 'completed'
                    }, 'getallresultdetails-result');

                } catch (error) {
                    console.error('getallresultdetails job failed:', error);
                    emitResult(io, clientSocketId, {
                        jobId, branchid, ptype, enrid,
                        error: error.message, status: 'failed'
                    }, 'getallresultdetails-error');
                    throw error;
                }
            }
        },
        { connection: sharedConnection, ...sharedConfig.workerConfig }
    );
};
