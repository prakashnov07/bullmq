
const { Worker } = require('bullmq');
const axios = require('axios');
const emitResult = require('./utils/emitResult');
const { connectionOptions } = require('./utils/sharedConnection');
const sharedConfig = require('./utils/sharedConfig');
const { devApiUrl, productionApiUrl } = require('./utils/serverUrl');


// Export a function that creates the worker with io instance
exports.createGetSchoolDataWorker = (io) => {
    return new Worker(
        'getschooldata-job',
        async job => {
            if (job.name == 'getschooldata') {
                const jobId = job.id;
                const name = job.name;
                const { branchid, owner, enrid, role, utype, medium, token, ptype, clientSocketId } = job.data;

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

                    // console.log('getschooldata received:', response.data?.schooldata);

                    emitResult(io, clientSocketId, {
                        jobId,
                        branchid,
                        ptype,
                        schooldata: response.data?.schooldata,
                        role,
                        status: 'completed'
                    }, 'getschooldata-result');

                    // return response.data?.schooldata;
                } catch (error) {
                    // clearTimeout(timeoutId);
                    console.error('getschooldata job failed:', error);

                    emitResult(io, clientSocketId, {
                        jobId,
                        branchid,
                        ptype,
                        error: error.message,
                        status: 'failed'
                    }, 'getschooldata-error');

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