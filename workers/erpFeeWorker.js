const { Queue, Worker } = require('bullmq');
const axios = require('axios');
const myQueue = new Queue('pending-fees-reload-job');
const { devUrl, productionUrl } = require('./utils/serverUrl');
const { sharedConnection } = require('./utils/sharedConnection');
const sharedConfig = require('./utils/sharedConfig');

exports.createErpFeeWorker = (io) => {
  return new Worker(
    myQueue.name,
    async job => {

      if (job.name == 'reset-feehead') {
        const enrid = job.data.enrid;
        const sessionid = job.data.sessionid;
        const branchid = job.data.branchid;
        const tomonth = job.data.tomonth;
        const rid = job.data.rid;

        try {
          await axios.post(`${productionUrl}/cron_jobs/RunBullMq.php`, { enrid, sessionid, branchid, name: job.name, tomonth, rid });
          console.log(job.data);
        } catch (error) {
          console.error(error);
          throw error;
        }
      }

      if (job.name == 'webhook') {
        const payid = job.data.payid;
        const orderid = job.data.orderid;
        const branchid = job.data.branchid;
        const status = job.data.status;
        const message = job.data.message;
        const razorpay_signature = job.data.razorpay_signature;
        
        try {
          await axios.post(`${productionUrl}/cron_jobs/RunWebhookBullMq.php`, { payid, orderid, branchid, status, message, razorpay_signature, name: job.name });
          console.log(job.data);
        } catch (error) {
          console.error(error);
          throw error;
        }
      }

      if (job.name == 'random_attendance') {
        const branchid = job.data.branchid;
        const sessionid = job.data.sessionid;
        const enrid = job.data.enrid;
        const dates = job.data.dates;
        const userid = job.data.userid;
        const priority = job.data.priority;

        try {
          await axios.post(`${productionUrl}/cron_jobs/RunBulkAttendanceBullMq.php`, { branchid, enrid, dates, userid, sessionid, priority, name: job.name });
          console.log(job.data);
        } catch (error) {
          console.error(error);
          throw error;
        }
      }

      if (job.name == 'send_fee_reminder') {
        const branchid = job.data.branchid;
        const sessionid = job.data.sessionid;
        const enrid = job.data.enrid;
        const title = job.data.title;
        const owner = job.data.owner;
        const month = job.data.month;
        const comment = job.data.comment;

        try {
          await axios.post(`${productionUrl}/cron_jobs/RunSendFeeReminderBullMq.php`, { branchid, enrid, sessionid, title, owner, month, comment, name: job.name });
          console.log(job.data);
        } catch (error) {
          console.error(error);
          throw error;
        }
      }

      if (job.name == 'send_message') {
        const branchid = job.data.branchid;
        const sessionid = job.data.sessionid;
        const enrid = job.data.enrid;
        const title = job.data.title;
        const owner = job.data.owner;
        const content = job.data.content;
        const classid = job.data.classid;
        const sectionid = job.data.sectionid;
        const token = job.data.token;

        try {
          await axios.post(`${productionUrl}/cron_jobs/RunSendMessageBullMq.php`, { branchid, enrid, sessionid, title, owner, content, classid, sectionid, token, name: job.name });
          console.log(job.data);
        } catch (error) {
          console.error(error);
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




