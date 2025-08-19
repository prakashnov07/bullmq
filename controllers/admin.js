const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const myQueue = new Queue('pending-fees-reload-job');



exports.addJob =  async (req, res, next) => {

    const enrid = req.body.enrid;
    const sessionid = req.body.sessionid;
    const tomonth = req.body.monthid;
    const rid = req.body.rid;
    const branchid = req.query.branchid;
    const jobName = req.body.queueName || 'reset-feehead';
    const delay = req.body.delay || 0;

    // myQueue.add(jobName, { enrid, sessionid, branchid, tomonth, rid }).then(() => {
    //     res.status(200).json({ message: 'Job added successfully' });
    // });

    await myQueue.add(jobName, { enrid, sessionid, branchid, tomonth, rid, jobName }, { delay });
   res.status(200).json({ message: 'Job added successfully' });

};

exports.addWebhookJob =  async (req, res, next) => {

    const payid = req.body.payid;
    const orderid = req.body.orderid;
    const status = req.body.status;
    const message = req.body.message;
    const branchid = req.body.branchid;
    const razorpay_signature = req.body.razorpay_signature;
    const jobName = req.body.jobName || 'webhook';
    const delay = req.body.delay || 30000; // Default delay of 30 seconds


    await myQueue.add(jobName, { payid, orderid, branchid, status, message, razorpay_signature, jobName }, { delay });
   res.status(200).json({ message: 'Job added successfully' });

};


exports.addBulkAttendanceJob = async (req, res, next) => {

    const { branchid, enrid, dates, jobName, userid, sessionid, priority } = req.body;

    await myQueue.add(jobName || 'random_attendance', { branchid, enrid, dates, userid, sessionid, priority }, { priority: priority || 20 });
    res.status(200).json({ message: 'Job added successfully' });

};
