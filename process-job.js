const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const myQueue = new Queue('pending-fees-reload-job', {connection : {host: 'localhost', port: 6379}});



// const connection = new IORedis({ maxRetriesPerRequest: null });

const worker = new Worker(
  myQueue.name,
  async job => {
    // Will print { foo: 'bar'} for the first job
    // and { qux: 'baz' } for the second.
    console.log(job.data);
  }
);