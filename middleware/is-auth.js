const Redis = require('ioredis');


module.exports = async (req, res, next) => {

    const redisClient = new Redis({
        host: 'localhost',
        port: 6379,
    });

    redisClient.on('error', (err) => {
        console.error('Redis error:', err);
    });

    redisClient.on('connect', () => {
        console.log('Connected to Redis for auth middleware');
    });

    const utype = req.body.utype ? req.body.utype : req.query.utype ? req.query.utype : req.params.utype ? req.params.utype : '';
    const owner = req.body.owner ? req.body.owner : req.query.owner ? req.query.owner : req.params.owner ? req.params.owner : '';
    const branchid = req.body.branchid ? req.body.branchid : req.query.branchid ? req.query.branchid : req.params.branchid ? req.params.branchid : '';

    const redisKey = utype === 'parent' ? `pwa_tokens:parent:${branchid}:${owner}` : `pwa_tokens:${branchid}:${owner}`;

   const storedAuth = await redisClient.get(redisKey);

   

    const authHeader = req.get('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Not authenticated. No Authorization header.' });
    }

    const token = authHeader; // Authorization: Bearer <token>
    if (!token) {
        return res.status(401).json({ message: 'Not authenticated. No token provided.' });
    }

    const auth = Buffer.from(token, 'base64')
        .toString('utf-8')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, ',')
        .substring(8);

    if (!auth) {
        return res.status(401).json({ message: 'Not authenticated. No token provided.' });
    }

    if (storedAuth !== auth) {
        return res.status(401).json({ message: 'Not authenticated. Invalid token.' });
    }

    redisClient.disconnect();

    next();
}