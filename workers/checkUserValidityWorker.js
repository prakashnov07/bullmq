
const { Worker } = require('bullmq');
const axios = require('axios');
const emitResult = require('./utils/emitResult');
const { sharedConnection } = require('./utils/sharedConnection');
const sharedConfig = require('./utils/sharedConfig');
const { devApiUrl, productionApiUrl } = require('./utils/serverUrl');


// Export a function that creates the worker with io instance
exports.createCheckUserValidityWorker = (io) => {
    return new Worker(
        'check-user-validity-cached-job',
        async job => {
            if (job.name == 'check-user-validity-cached') {
                const jobId = job.id;
                const name = job.name;
                const { branchid, owner, enrid, role, utype, medium, token, ptype, clientSocketId, navigate } = job.data;

                try {
                    const response = await axios.get(`${productionApiUrl}/${job.name}`, {
                        params: { branchid, owner, enrid, role, utype, medium, token, ptype, clientSocketId },
                        // timeout: 40000 , // 40 seconds timeout for the request

                        headers: {
                            'content-type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        }
                    }
                    );

                    // clearTimeout(timeoutId);

                    // console.log('check-user-validity-cached received:', response.data?.students);

                    emitResult(io, clientSocketId, {
                        jobId,
                        branchid,
                        ptype,
                        students: response.data?.students,
                        test:response.data?.test,
                        navigate,
                        role,
                        status: 'completed'
                    }, 'check-user-validity-cached-result');

                    // return response.data?.students;
                } catch (error) {
                    // clearTimeout(timeoutId);
                    console.error('check-user-validity-cached job failed:', error);

                    emitResult(io, clientSocketId, {
                        jobId,
                        branchid,
                        ptype,
                        error: error.message,
                        status: 'failed'
                    }, 'check-user-validity-cached-error');

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