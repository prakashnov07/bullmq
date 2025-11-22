const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    
    // Fork workers equal to CPU cores
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    
    // Handle worker crashes
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
        console.log('Starting a new worker...');
        cluster.fork(); // Restart crashed worker
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('Master received SIGTERM, shutting down workers...');
        for (const id in cluster.workers) {
            cluster.workers[id].kill();
        }
    });
    
} else {
    // Worker process - run your app
    require('./app.js');
    console.log(`Worker ${process.pid} started`);
}