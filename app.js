const express = require('express');
const app = express();

// Create multiple worker instances with optimized settings for cluster mode

//const workerCount = require('os').cpus().length * 2; // 2x CPU cores

//Reduce worker count per process since you'll have multiple processes in cluster mode
// const workerCountPerProcess = process.env.NODE_ENV === 'production' 
//     ? Math.max(1, Math.floor(require('os').cpus().length / 2))
//     : require('os').cpus().length * 2;

    // Reduce worker count for better performance
const workerCountPerProcess = process.env.NODE_ENV === 'production' ? 1 : 1;

const {createServer} = require('http');
const {Server} = require('socket.io');
const server = createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
   // Enable sticky sessions for cluster
  adapter: process.env.NODE_ENV === 'production' ? require('socket.io-redis')() : undefined
});

// Enable Redis adapter for multi-process Socket.IO
if (process.env.NODE_ENV === 'production') {
  const redisAdapter = require('socket.io-redis');
  io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));
}

// Make io available to routes
app.set('io', io);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
   console.log(`Client disconnected: ${socket.id} on process ${process.pid}`);
  });
});


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

// Add the common params middleware
const extractCommonParams = require('./middleware/extractCommonParams');
app.use(extractCommonParams);




// FIXED: Create workers properly
const { createPullPolicyWorker } = require('./workers/pullPolicyWorker');
const erpFeeWorker = require('./workers/erpFeeWorker');
const {createHomeWorkWorker} = require('./workers/homeWorkWorker');
createHomeWorkWorker(io); // Initialize homework worker

const workers = [];

// Create pull policy workers
for (let i = 0; i < workerCountPerProcess; i++) {
    const worker = createPullPolicyWorker(io);
    
    worker.on('error', (err) => {
        console.error(`Pull Policy Worker ${i} error:`, err.message);
    });
    
    worker.on('failed', (job, err) => {
        console.error(`Pull Policy Job ${job.id} failed on worker ${i}:`, err.message);
    });
    
    worker.on('stalled', (jobId) => {
        console.warn(`Pull Policy Job ${jobId} stalled on worker ${i}`);
    });
    
    workers.push(worker);
}

// Add ERP fee worker to workers array for proper cleanup
workers.push(erpFeeWorker.worker);

// Error handling for ERP fee worker
erpFeeWorker.worker.on('error', err => {
  console.error('ERP Fee Worker error:', err.message);
});

erpFeeWorker.worker.on('failed', (job, err) => {
  console.error(`ERP Fee Job ${job.id} failed:`, err.message);
});

const port = process.env.PORT || 4040;
server.listen(port, () => {
  console.log(`Worker ${process.pid} listening on port ${port}`);
});

// Improved graceful shutdown
process.on('SIGTERM', async () => {
    console.log(`Process ${process.pid} received SIGTERM, shutting down gracefully...`);
    
    try {
        // Close all BullMQ workers properly
        await Promise.all(workers.map(worker => worker.close()));
        console.log('All workers closed successfully');
        
        // Close server
        server.close(() => {
            console.log(`Process ${process.pid} shut down successfully`);
            process.exit(0);
        });
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});