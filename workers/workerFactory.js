// workers/workerFactory.js
const { createPullPolicyWorker } = require('./pullPolicyWorker');
const { createHomeWorkWorker } = require('./homeWorkWorker');
const { createErpFeeWorker } = require('./erpFeeWorker');
const { createMessagesWorker } = require('./messagesWorker');
const {createCheckUserValidityWorker} = require('./checkUserValidityWorker');
const {createGetSchoolDataWorker} = require('./getSchoolDataWork');
const { createCmoWorker } = require('./cmoWorker');
const {createClassesWorker}= require('./classesWorker');
const {createSectionsWorker}= require('./sectionsWorker');
const {createSubjectsWorker}= require('./subjectsWorker');
const {createBanksWorker}= require('./banksWorker');
const { createFCMTokenWorker } = require('./fcmTokenWorker');
const { createSchoolDiaryWorker } = require('./schoolDiaryWorker');
const { createOnlineClassesWorker } = require('./onlineClassesWorker');
const { createOnlineExamsWorker } = require('./onlineExamsWorker');
const { createResultDetailsWorker } = require('./resultDetailsWorker');
const { createStudentBusIdWorker } = require('./studentBusIdWorker');
const { createTransportSettingsWorker } = require('./transportSettingsWorker');
const { createAllTransportStationsWorker } = require('./allTransportStationsWorker');
const { createUpdateAppTransportWorker } = require('./updateAppTransportWorker');
// const { createBulkAttendanceWorker } = require('./bulkAttendanceWorker');
// const { createFeeReminderWorker } = require('./feeReminderWorker');
// const { createMessageWorker } = require('./messageWorker');

const workerFactories = {
    'pull-policy': createPullPolicyWorker,
    'homework': createHomeWorkWorker,
    'erp-fee': createErpFeeWorker,
    'messages': createMessagesWorker,
    'check-user-validity-cached': createCheckUserValidityWorker,
    'getschooldata': createGetSchoolDataWorker,
    'getallclasses': createClassesWorker,
    'getallsections': createSectionsWorker,
    'cmo': createCmoWorker,
    'getsubjects': createSubjectsWorker,
    'fetch-public-banks': createBanksWorker,
    'storeFCMToken': createFCMTokenWorker,
    'fetch-student-report': createSchoolDiaryWorker,
    'online-classes-student': createOnlineClassesWorker,
    'online-exams-student': createOnlineExamsWorker,
    'getallresultdetails': createResultDetailsWorker,
    'student-busid': createStudentBusIdWorker,
    'transport-settings-app': createTransportSettingsWorker,
    'all-transport-stations': createAllTransportStationsWorker,
    'update-app-transport': createUpdateAppTransportWorker,

    // 'bulk-attendance': createBulkAttendanceWorker,
    // 'fee-reminder': createFeeReminderWorker,
    // 'message': createMessageWorker
};

const createAllWorkers = (io, workerCount = 1) => {
    const workers = [];
    const maxConcurrencyPerWorker = 50;
    Object.entries(workerFactories).forEach(([workerType, createWorker]) => {
        console.log(`Creating ${workerCount} ${workerType} workers with ${maxConcurrencyPerWorker} concurrency each...`);

        for (let i = 0; i < workerCount; i++) {
            try {
                const worker = createWorker(io);

                // Add common error handling
                worker.on('error', (err) => {
                    // console.error(`${workerType} Worker ${i} error: workerFactory`, err.message);
                });

                worker.on('failed', (job, err) => {
                    console.error(`${workerType} Job ${job.id} failed on worker ${i}:`, err.message);
                });

                worker.on('stalled', (jobId) => {
                    console.warn(`${workerType} Job ${jobId} stalled on worker ${i}`);
                });

                // High-performance event handling
                worker.on('completed', (job) => {
                    // Minimal logging for performance
                    if (process.env.NODE_ENV !== 'production') {
                        console.log(`${workerType}-${i}: Job ${job.id} completed`);
                    }
                });

                workers.push({
                    type: workerType,
                    instance: worker,
                    id: i
                });

                console.log(`Created ${workerType} worker ${i}`);

            } catch (error) {
                console.error(`Failed to create ${workerType} worker ${i}:`, error.message);
            }
        };
    });

    const totalCapacity = workers.length * maxConcurrencyPerWorker;
    console.log(`Total theoretical capacity: ${totalCapacity} concurrent jobs`);

    return workers;
};

module.exports = { createAllWorkers, workerFactories };