const { Worker } = require('bullmq');
const axios = require('./utils/optimizedAxios');
const emitResult = require('./utils/emitResult');
const { sharedConnection } = require('./utils/sharedConnection');
const sharedConfig = require('./utils/sharedConfig');
const { devApiUrl, productionApiUrl } = require('./utils/serverUrl');

exports.createTransportSettingsWorker = (io) => {
    return new Worker(
        'transport-settings-app-job',
        async job => {
            if (job.name == 'transport-settings-app') {
                const jobId = job.id;
                const { branchid, owner, enrid, role, utype, medium, token, ptype, clientSocketId, month } = job.data;

                try {
                    const response = await axios.get(`${productionApiUrl}/${job.name}`, {
                        params: { branchid, owner, enrid, role, utype, medium, token, ptype, clientSocketId, month },
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
                    }, 'transport-settings-app-result');

                } catch (error) {
                    console.error('transport-settings-app job failed:', error);

                    emitResult(io, clientSocketId, {
                        jobId,
                        branchid,
                        ptype,
                        error: error.message,
                        status: 'failed'
                    }, 'transport-settings-app-error');

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
