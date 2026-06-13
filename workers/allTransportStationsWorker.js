const { Worker } = require('bullmq');
const axios = require('./utils/optimizedAxios');
const emitResult = require('./utils/emitResult');
const { sharedConnection } = require('./utils/sharedConnection');
const sharedConfig = require('./utils/sharedConfig');
const { devApiUrl, productionApiUrl } = require('./utils/serverUrl');

exports.createAllTransportStationsWorker = (io) => {
    return new Worker(
        'all-transport-stations-job',
        async job => {
            if (job.name == 'all-transport-stations') {
                const jobId = job.id;
                const { branchid, owner, enrid, role, utype, medium, token, ptype, clientSocketId } = job.data;

                try {
                    const response = await axios.get(`${productionApiUrl}/${job.name}`, {
                        params: { branchid, owner, enrid, role, utype, medium, token, ptype, clientSocketId },
                        headers: {
                            'content-type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        }
                    });

                    emitResult(io, clientSocketId, {
                        jobId,
                        branchid,
                        ptype,
                        ...response.data,
                        status: 'completed'
                    }, 'all-transport-stations-result');

                } catch (error) {
                    console.error('all-transport-stations job failed:', error);

                    emitResult(io, clientSocketId, {
                        jobId,
                        branchid,
                        ptype,
                        error: error.message,
                        status: 'failed'
                    }, 'all-transport-stations-error');

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
