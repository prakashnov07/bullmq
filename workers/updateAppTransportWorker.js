const { Worker } = require('bullmq');
const axios = require('./utils/optimizedAxios');
const emitResult = require('./utils/emitResult');
const { sharedConnection } = require('./utils/sharedConnection');
const sharedConfig = require('./utils/sharedConfig');
const { devApiUrl, productionApiUrl } = require('./utils/serverUrl');

exports.createUpdateAppTransportWorker = (io) => {
    return new Worker(
        'update-app-transport-job',
        async job => {
            if (job.name == 'update-app-transport') {
                const jobId = job.id;
                const { branchid, owner, enrid, role, utype, medium, token, ptype, clientSocketId, action, month, routeid, regno } = job.data;

                try {
                    const response = await axios.post(`${productionApiUrl}/${job.name}`, {
                        action,
                        month,
                        routeid,
                        regno,
                        branchid
                    }, {
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
                    }, 'update-app-transport-result');

                } catch (error) {
                    console.error('update-app-transport job failed:', error);

                    emitResult(io, clientSocketId, {
                        jobId,
                        branchid,
                        ptype,
                        error: error.message,
                        status: 'failed'
                    }, 'update-app-transport-error');

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
