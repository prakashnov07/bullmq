const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const myQueue = new Queue('pending-fees-reload-job');

async function addJobs() {
  await myQueue.add('myJobName', { foo: 'Dhiraj' });
  await myQueue.add('myJobName', { qux: 'Sah' });
}

 addJobs();