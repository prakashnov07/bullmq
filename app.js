const express = require('express');
const app = express();

// Create multiple worker instances with optimized settings for cluster mode

//const workerCount = require('os').cpus().length * 2; // 2x CPU cores

//Reduce worker count per process since you'll have multiple processes in cluster mode
// const workerCountPerProcess = process.env.NODE_ENV === 'production' 
//     ? Math.max(1, Math.floor(require('os').cpus().length / 2))
//     : require('os').cpus().length * 2;

    // Reduce worker count for better performance
//const workerCountPerProcess = process.env.NODE_ENV === 'production' ? 1 : 1;


// Or even more aggressive scaling, // Up to 32 workers
const workerCountPerProcess = process.env.NODE_ENV === 'production' 
    ? Math.min(require('os').cpus().length * 4, 32) 
    : 1;

const {createServer} = require('http');
const {Server} = require('socket.io');
const server = createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
   // Enable sticky sessions for cluster
  adapter: process.env.NODE_ENV === 'production' ? require('socket.io-redis')() : undefined
});


// Make io available to routes
app.set('io', io);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
   console.log(`Client disconnected: ${socket.id} on process ${process.pid}`);
  });
});


// IMPROVED CORS HANDLING
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  //Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request for:', req.url);
    res.status(200).end();
    return;
  }
  
  next();
});

const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '1mb' }));

// Add the common params middleware, now using route wise in admin routes
// const extractCommonParams = require('./middleware/extractCommonParams');
// app.use(extractCommonParams);

const adminRoute = require('./routes/admin');
app.use(adminRoute);

// const erpFeeWorker = require('./workers/erpFeeWorker');

// IMPROVED: Create all workers using factory
const { createAllWorkers } = require('./workers/workerFactory');

console.log('Initializing workers...');
const workers = createAllWorkers(io, workerCountPerProcess);

console.log(`Total workers created: ${workers.length}`);
workers.forEach(worker => {
    console.log(`- ${worker.type} worker ${worker.id}`);
});



// const port = process.env.PORT || 4040; // local
const port = 4040; // production
server.listen(port, () => {
  console.log(`Process ${process.pid} listening on port ${port} with ${workers.length} total workers`);
});

// Improved graceful shutdown
process.on('SIGTERM', async () => {
    console.log(`Process ${process.pid} received SIGTERM, shutting down gracefully...`);
    
    try {
        // Close all workers
        await Promise.all(workers.map(worker => worker.instance.close()));
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

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});