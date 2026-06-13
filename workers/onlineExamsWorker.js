const { Worker } = require('bullmq');
const axios = require('axios');
const emitResult = require('./utils/emitResult');
const { sharedConnection } = require('./utils/sharedConnection');
const sharedConfig = require('./utils/sharedConfig');
const { devApiUrl, productionApiUrl } = require('./utils/serverUrl');

exports.createOnlineExamsWorker = (io) => {
    return new Worker(
        'online-exams-student-job',
        async job => {
            if (job.name == 'online-exams-student') {
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
                        papers: response.data?.papers,
                        days: response.data?.days,
                        selectedDate: response.data?.selectedDate,
                        status: 'completed'
                    }, 'online-exams-student-result');

                } catch (error) {
                    console.error('online exams job failed:', error);
                    emitResult(io, clientSocketId, {
                        jobId, branchid, ptype, enrid,
                        error: error.message, status: 'failed'
                    }, 'online-exams-student-error');
                    throw error;
                }
            }
        },
        { connection: sharedConnection, ...sharedConfig.workerConfig }
    );
};
