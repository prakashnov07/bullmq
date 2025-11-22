// middleware/extractCommonParams.js
const extractCommonParams = (req, res, next) => {
    // Extract common parameters
    req.commonParams = {
        medium: req.query.medium || req.body.medium || 'pwa',
        branchid: req.query.branchid || req.body.branchid,
        owner: req.query.owner || req.body.owner || req.query.phone || req.body.phone,
        enrid: req.query.enrid || req.body.enrid || req.query.id || req.body.id,
        role: req.query.role || req.body.role,
        utype: req.query.utype || req.body.utype,
        token: req.get('Authorization') || '',
        clientSocketId: req.query.clientSocketId || req.body.clientSocketId || '',
        jobName: req.body.jobName || req.query.jobName || '',
        priority: req.body.priority || req.query.priority || 1,
        ptype:req.body.ptype || req.query.ptype || ''
    };
    
    // Validate required parameters
    const requiredParams = ['branchid', 'owner', 'enrid', 'role', 'utype', 'medium', 'token', 'clientSocketId', 'jobName', 'priority', 'ptype'];
    const missingParams = requiredParams.filter(param => !req.commonParams[param]);
    
    if (missingParams.length > 0) {
        return res.status(400).json({
            error: 'Missing required parameters',
            missing: missingParams,
            note: 'Required parameters: medium, branchid, owner, enrid, role, utype'
        });
    }
    
    // Add helper methods to req object
    req.getCommonJobData = () => ({
        medium: req.commonParams.medium,
        branchid: req.commonParams.branchid,
        owner: req.commonParams.owner,
        enrid: req.commonParams.enrid,
        role: req.commonParams.role,
        utype: req.commonParams.utype,
        token: req.commonParams.token,
        clientSocketId: req.commonParams.clientSocketId,
        jobName: req.commonParams.jobName,
        priority: req.commonParams.priority,
        ptype: req.commonParams.ptype
    });
    
    next();
};

module.exports = extractCommonParams;