const { Worker } = require('bullmq');
const axios = require('axios');
const emitResult = require('./utils/emitResult');
const { sharedConnection } = require('./utils/sharedConnection');
const sharedConfig = require('./utils/sharedConfig');
const { devApiUrl, productionApiUrl } = require('./utils/serverUrl');

exports.createOnlineClassesWorker = (io) => {
    return new Worker(
        'online-classes-student-job',
        async job => {
            if (job.name == 'online-classes-student') {
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
                        allClasses: response.data?.allClasses,
                        status: 'completed'
                    }, 'online-classes-student-result');

                } catch (error) {
                    console.error('online classes job failed:', error);
                    emitResult(io, clientSocketId, {
                        jobId, branchid, ptype, enrid,
                        error: error.message, status: 'failed'
                    }, 'online-classes-student-error');
                    throw error;
                }
            }
        },
        { connection: sharedConnection, ...sharedConfig.workerConfig }
    );
};
