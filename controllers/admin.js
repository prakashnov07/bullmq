const { Queue, Worker } = require('bullmq');
const { sharedConnection } = require('../workers/utils/sharedConnection');
const queueOpts = { connection: sharedConnection };
const myQueue = new Queue('pending-fees-reload-job', queueOpts);
const policyQueue = new Queue('pull-policy-job', queueOpts);
const homeworkQueue = new Queue('fetch-home-work-job', queueOpts);
const schoolDiaryQueue = new Queue('fetch-student-report-job', queueOpts);
const messagesQueue = new Queue('add-fetch-messages-job', queueOpts);
const checkUserValidityQueue = new Queue('check-user-validity-cached-job', queueOpts);
const getSchoolDataQueue = new Queue('getschooldata-job', queueOpts);
const getCmoQueue = new Queue('getcmo-job', queueOpts);
const getAllClassesQueue = new Queue('getallclasses-job', queueOpts);
const getAllSectionsQueue = new Queue('getallsections-job', queueOpts);
const getSubjectsQueue = new Queue('getsubjects-job', queueOpts);
const getPublicBanksQueue = new Queue('fetch-public-banks-job', queueOpts);
const storeFCMTokenQueue = new Queue('storefcmtoken-job', queueOpts);
const onlineClassesQueue = new Queue('online-classes-student-job', queueOpts);
const onlineExamsQueue = new Queue('online-exams-student-job', queueOpts);
const getAllResultDetailsQueue = new Queue('getallresultdetails-job', queueOpts);
const studentBusIdQueue = new Queue('student-busid-job', queueOpts);
const transportSettingsQueue = new Queue('transport-settings-app-job', queueOpts);
const allTransportStationsQueue = new Queue('all-transport-stations-job', queueOpts);
const updateAppTransportQueue = new Queue('update-app-transport-job', queueOpts);


exports.addJob = async (req, res, next) => {

    const enrid = req.body.enrid;
    const sessionid = req.body.sessionid;
    const tomonth = req.body.monthid;
    const rid = req.body.rid;
    const branchid = req.query.branchid ? req.query.branchid : req.body.branchid;
    const jobName = req.body.queueName || 'reset-feehead';
    const delay = req.body.delay || 0;

    // myQueue.add(jobName, { enrid, sessionid, branchid, tomonth, rid }).then(() => {
    //     res.status(200).json({ message: 'Job added successfully' });
    // });

    const jobId = `erpFee-${enrid}-${sessionid}-${branchid}-${tomonth}-${rid}-${jobName}`;
    
    console.log(`[ADMIN] Adding job: ${jobName} with ID: ${jobId}`);
    
    await myQueue.add(jobName, { enrid, sessionid, branchid, tomonth, rid, jobName }, { 
        delay,
        jobId // Determinstic ID prevents duplicates
    });
    res.status(200).json({ message: 'Job added successfully', jobId });

};

exports.addWebhookJob = async (req, res, next) => {

    const payid = req.body.payid;
    const orderid = req.body.orderid;
    const status = req.body.status;
    const message = req.body.message;
    const branchid = req.body.branchid;
    const razorpay_signature = req.body.razorpay_signature;
    const jobName = req.body.jobName || 'webhook';
    const delay = req.body.delay || 30000; // Default delay of 30 seconds


    const jobId = `webhook-${payid}-${orderid}-${branchid}-${status}-${jobName}`;

    console.log(`[ADMIN] Adding Webhook job: ${jobName} with ID: ${jobId}`);

    await myQueue.add(jobName, { payid, orderid, branchid, status, message, razorpay_signature, jobName }, { 
        delay,
        jobId 
    });
    res.status(200).json({ message: 'Job added successfully', jobId });

};


exports.addBulkAttendanceJob = async (req, res, next) => {

    const { branchid, enrid, dates, jobName, userid, sessionid, priority } = req.body;

    await myQueue.add(jobName || 'random_attendance', { branchid, enrid, dates, userid, sessionid, priority }, { priority: priority || 20 });
    res.status(200).json({ message: 'Job added successfully' });

};

exports.addSendFeeReminderJob = async (req, res, next) => {

    const { enrid, title, month, comment, branchid, sessionid, owner, jobName, priority } = req.body;

    await myQueue.add(jobName || 'send_fee_reminder', { branchid, enrid, sessionid, title, owner, month, comment }, { priority: priority || 19 });
    res.status(200).json({ message: 'Job added successfully' });
};

exports.addSendMessageJob = async (req, res, next) => {

    const { enrid, classid, sectionid, token, content, title, branchid, sessionid, owner, jobName, priority } = req.body;
    await myQueue.add(jobName || 'send_message', { branchid, enrid, sessionid, title, owner, content, classid, sectionid, token }, { priority: priority || 18 });
    res.status(200).json({ message: 'Job added successfully' });
};

exports.postAddPullPolicyJob = async (req, res, next) => {
    const { ptype, jobName, priority, branchid, clientSocketId } = req.body;
    const token =req.get('Authorization');
    // Add the client socket ID to job data so worker knows where to send results
    await policyQueue.add(jobName || 'pull-policy', {
        branchid,
        token,
        ptype,
        clientSocketId
    }, {
        priority: priority || 1
    });

    res.status(200).json({
        message: 'Job added successfully',
        note: 'Results will be sent via WebSocket'
    });
};

exports.postAddFetchHomeWorkJob = async (req, res, next) => {

    const {reportdate} = req.body;
   
    await homeworkQueue.add(req.commonParams.jobName || 'viewhomeworkself', {
       
        ...req.getCommonJobData(),
        reportdate
    }, {
        priority: req.commonParams.priority || 1
    });

    res.status(200).json({
        message: 'Job added successfully',
        note: 'Results will be sent via WebSocket'
    });
};

exports.postAddFetchMessagesJob = async (req, res, next) => {
   const id = req.body.id;
    await messagesQueue.add(req.commonParams.jobName || 'home-page-messages-2', {
       
        ...req.getCommonJobData(),
        id
    }, {
        priority: req.commonParams.priority || 1
    });

    res.status(200).json({
        message: 'Job added successfully',
        note: 'Results will be sent via WebSocket'
    });
};

exports.postAddCheckUserValidityCachedJob = async (req, res, next) => {
   const navigate = req.body.navigate;
    await checkUserValidityQueue.add(req.commonParams.jobName || 'check-user-validity-cached', {
       
        ...req.getCommonJobData(),
        navigate
    }, {
        priority: req.commonParams.priority || 1
    });

    res.status(200).json({
        message: 'Job added successfully',
        note: 'Results will be sent via WebSocket'
    });
};

exports.postAddFetchSchoolDataJob = async (req, res, next) => {
    await getSchoolDataQueue.add(req.commonParams.jobName || 'getschooldata', {
       
        ...req.getCommonJobData()
    }, {
        priority: req.commonParams.priority || 1
    });

    res.status(200).json({
        message: 'Job added successfully',
        note: 'Results will be sent via WebSocket'
    });
};

exports.postAddGetCmoJob = async (req, res, next) => {
    await getCmoQueue.add(req.commonParams.jobName || 'getcmo', {
       
        ...req.getCommonJobData()
    }, {
        priority: req.commonParams.priority || 1
    });

    res.status(200).json({
        message: 'Job added successfully',
        note: 'Results will be sent via WebSocket'
    });
};

exports.postAddGetAllClassesJob = async (req, res, next) => {
    await getAllClassesQueue.add(req.commonParams.jobName || 'getallclasses', {
       
        ...req.getCommonJobData()
    }, {
        priority: req.commonParams.priority || 1
    });

    res.status(200).json({
        message: 'Job added successfully',
        note: 'Results will be sent via WebSocket'
    });
};

exports.postAddGetAllSectionsJob = async (req, res, next) => {
    await getAllSectionsQueue.add(req.commonParams.jobName || 'getallsections', {
       
        ...req.getCommonJobData()
    }, {
        priority: req.commonParams.priority || 1
    });

    res.status(200).json({
        message: 'Job added successfully',
        note: 'Results will be sent via WebSocket'
    });
};

exports.postAddGetAllSubjectsJob = async (req, res, next) => {
    await getSubjectsQueue.add(req.commonParams.jobName || 'getsubjects', {
       
        ...req.getCommonJobData()
    }, {
        priority: req.commonParams.priority || 1
    });

    res.status(200).json({
        message: 'Job added successfully',
        note: 'Results will be sent via WebSocket'
    });
};

exports.postAddFetchPublicBanksJob = async (req, res, next) => {
    await getPublicBanksQueue.add(req.commonParams.jobName || 'fetchpublicbanks', {
       
        ...req.getCommonJobData()
    }, {
        priority: req.commonParams.priority || 1
    });

    res.status(200).json({
        message: 'Job added successfully',
        note: 'Results will be sent via WebSocket'
    });
};

exports.postAddStoreFCMTokenJob = async (req, res, next) => {
    const fcmToken = req.body.fcmToken;
    await storeFCMTokenQueue.add(req.commonParams.jobName || 'storefcmtoken', {
       
        ...req.getCommonJobData(),
        fcmToken
    }, {
        priority: req.commonParams.priority || 50
    });

    res.status(200).json({
        message: 'Job added successfully',
        note: 'Results will be sent via WebSocket'
    });
};

exports.postAddFetchStudentReportJob = async (req, res, next) => {

    const {reportdate, toreportdate, category, studentsforreportdetails} = req.body;
   
    await schoolDiaryQueue.add(req.commonParams.jobName || 'viewstudentreport', {
       
        ...req.getCommonJobData(),
        reportdate,
        toreportdate,
        category,
        studentsforreportdetails
    }, {
        priority: req.commonParams.priority || 1
    });

    res.status(200).json({
        message: 'Job added successfully',
        note: 'Results will be sent via WebSocket'
    });
};

exports.postAddOnlineClassesJob = async (req, res, next) => {
    await onlineClassesQueue.add(req.commonParams.jobName || 'online-classes-student', {
        ...req.getCommonJobData()
    }, {
        priority: req.commonParams.priority || 1
    });

    res.status(200).json({
        message: 'Job added successfully',
        note: 'Results will be sent via WebSocket'
    });
};

exports.postAddOnlineExamsJob = async (req, res, next) => {
    await onlineExamsQueue.add(req.commonParams.jobName || 'online-exams-student', {
        ...req.getCommonJobData()
    }, {
        priority: req.commonParams.priority || 1
    });

    res.status(200).json({
        message: 'Job added successfully',
        note: 'Results will be sent via WebSocket'
    });
};

exports.postAddGetAllResultDetailsJob = async (req, res, next) => {
    await getAllResultDetailsQueue.add(req.commonParams.jobName || 'getallresultdetails', {
        ...req.getCommonJobData()
    }, {
        priority: req.commonParams.priority || 1
    });

    res.status(200).json({
        message: 'Job added successfully',
        note: 'Results will be sent via WebSocket'
    });
};

exports.postAddStudentBusIdJob = async (req, res, next) => {
    const { regno } = req.body;
    await studentBusIdQueue.add(req.commonParams.jobName || 'student-busid', {
        ...req.getCommonJobData(),
        regno
    }, {
        priority: req.commonParams.priority || 1
    });

    res.status(200).json({
        message: 'Job added successfully',
        note: 'Results will be sent via WebSocket'
    });
};

exports.postAddTransportSettingsAppJob = async (req, res, next) => {
    const { month } = req.body;
    await transportSettingsQueue.add(req.commonParams.jobName || 'transport-settings-app', {
        ...req.getCommonJobData(),
        month
    }, {
        priority: req.commonParams.priority || 1
    });

    res.status(200).json({
        message: 'Job added successfully',
        note: 'Results will be sent via WebSocket'
    });
};

exports.postAddAllTransportStationsJob = async (req, res, next) => {
    await allTransportStationsQueue.add(req.commonParams.jobName || 'all-transport-stations', {
        ...req.getCommonJobData()
    }, {
        priority: req.commonParams.priority || 1
    });

    res.status(200).json({
        message: 'Job added successfully',
        note: 'Results will be sent via WebSocket'
    });
};

exports.postAddUpdateAppTransportJob = async (req, res, next) => {
    const { action, month, routeid } = req.body;
    await updateAppTransportQueue.add(req.commonParams.jobName || 'update-app-transport', {
        ...req.getCommonJobData(),
        action,
        month,
        routeid
    }, {
        priority: req.commonParams.priority || 1
    });

    res.status(200).json({
        message: 'Job added successfully',
        note: 'Results will be sent via WebSocket'
    });
};