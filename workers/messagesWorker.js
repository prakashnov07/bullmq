
const { Worker } = require('bullmq');
const axios = require('./utils/optimizedAxios');
const emitResult = require('./utils/emitResult');
const { sharedConnection } = require('./utils/sharedConnection');
const sharedConfig = require('./utils/sharedConfig');
const { devApiUrl, productionApiUrl } = require('./utils/serverUrl');


// Export a function that creates the worker with io instance
exports.createMessagesWorker = (io) => {
    return new Worker(
        'add-fetch-messages-job',
        async job => {
            if (job.name == 'home-page-messages-2') {
                const jobId = job.id;
                const name = job.name;
                const { branchid, owner, enrid, role, utype, medium, token, ptype, clientSocketId, id } = job.data;

                // Add job processing timeout
                // const timeoutId = setTimeout(() => {
                //     console.warn(`Job ${job.id} is taking too long, potential stall`);
                // }, 40000); // 40 seconds

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

                    // clearTimeout(timeoutId);

                    // console.log('messages data received:', response.data?.messages);

                    // Now you can use the io instance properly

                    emitResult(io, clientSocketId, {
                        jobId,
                        branchid,
                        ptype,
                        lastMessageId: id,
                        messages: response.data?.messages,
                        scheduledMessages: response.data?.scheduledMessages,
                        status: 'completed'
                    }, 'messages-result');


                    // return response.data?.messages;

                } catch (error) {
                    // clearTimeout(timeoutId);
                    console.error('messages job failed:', error);
                    // Emit error to client

                    emitResult(io, clientSocketId, {
                        jobId,
                        branchid,
                        ptype,
                        error: error.message,
                        status: 'failed'
                    }, 'messages-error');

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