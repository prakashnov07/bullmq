const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');



router.post('/add-job', adminController.addJob);
router.post('/add-webhook-job', adminController.addWebhookJob);
router.post('/add-bulkattendance-job', adminController.addBulkAttendanceJob);



module.exports = router;