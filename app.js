const express = require('express');
const app = express();

const { Queue, Worker } = require('bullmq');
const myQueue = new Queue('pending-fees-reload-job');
const IORedis = require('ioredis');
const axios = require('axios');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '1mb' }));

const adminRoute = require('./routes/admin');
app.use(adminRoute);



const connection = new IORedis({ maxRetriesPerRequest: null });

const FeeResetWorker = new Worker(
  myQueue.name,
  async job => {

    if (job.name == 'reset-feehead') {
      const enrid = job.data.enrid;
      const sessionid = job.data.sessionid;
      const branchid = job.data.branchid;
      const tomonth = job.data.tomonth;
      const rid = job.data.rid;
      

      axios.post('http://school.local/cron_jobs/RunBullMq.php', { enrid, sessionid, branchid, name: job.name, tomonth, rid })
        .then(response => {
          console.log(job.data);
        })
        .catch(error => {
          console.error(error);
        });
    }

    if (job.name == 'webhook') {
      const payid = job.data.payid;
      const orderid = job.data.orderid;
      const branchid = job.data.branchid;
      const status = job.data.status;
      const message = job.data.message;
      const razorpay_signature = job.data.razorpay_signature;
      axios.post('http://school.local/cron_jobs/RunWebhookBullMq.php', { payid, orderid, branchid, status, message, razorpay_signature, name: job.name })
        .then(response => {
          console.log(job.data);
        })
        .catch(error => {
          console.error(error);
        });
    }
  },
  { connection },
);



app.listen(4040);