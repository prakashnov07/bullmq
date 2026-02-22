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

// Production-ready Socket.IO configuration
let socketConfig = {
  cors: { 
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL || 'https://yourdomain.com'] 
      : '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e6,
  allowEIO3: true
};

// Add Redis adapter for production cluster mode
if (process.env.NODE_ENV === 'production') {
  try {
    const { createAdapter } = require('@socket.io/redis-adapter');
    const { createClient } = require('redis');
    
    const pubClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      retry_strategy: (options) => {
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error('Redis retry time exhausted');
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });
    const subClient = pubClient.duplicate();
    
    // Connect and set adapter
    Promise.all([pubClient.connect(), subClient.connect()])
      .then(() => {
        const redisAdapter = createAdapter(pubClient, subClient);
        io.adapter(redisAdapter);
        console.log('✅ Redis adapter configured for production cluster mode');
      })
      .catch((error) => {
        console.warn('⚠️  Redis adapter failed, Socket.IO will use memory store:', error.message);
      });
  } catch (error) {
    console.warn('⚠️  Redis adapter dependencies not found:', error.message);
  }
}

const io = new Server(server, socketConfig);


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
const port = process.env.PORT || 4040; // Use environment PORT or default to 4040
server.listen(port, '0.0.0.0', () => {
  console.log(`Process ${process.pid} listening on port ${port} with ${workers.length} total workers`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Socket.IO CORS origin: ${socketConfig.cors.origin}`);
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