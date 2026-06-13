const { Worker } = require('bullmq');
const axios = require('./utils/optimizedAxios');
const emitResult = require('./utils/emitResult');
const { sharedConnection } = require('./utils/sharedConnection');
const sharedConfig = require('./utils/sharedConfig');
const { devApiUrl, productionApiUrl } = require('./utils/serverUrl');

exports.createStudentBusIdWorker = (io) => {
    return new Worker(
        'student-busid-job',
        async job => {
            if (job.name == 'student-busid') {
                const jobId = job.id;
                const { branchid, owner, enrid, role, utype, medium, token, ptype, clientSocketId, regno } = job.data;

                try {
                    const response = await axios.get(`${productionApiUrl}/${job.name}`, {
                        params: { branchid, owner, enrid, role, utype, medium, token, ptype, clientSocketId, regno },
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
                    }, 'student-busid-result');

                } catch (error) {
                    console.error('student-busid job failed:', error);

                    emitResult(io, clientSocketId, {
                        jobId,
                        branchid,
                        ptype,
                        error: error.message,
                        status: 'failed'
                    }, 'student-busid-error');

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
