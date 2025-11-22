const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');



router.post('/add-job', adminController.addJob);
router.post('/add-webhook-job', adminController.addWebhookJob);
router.post('/add-bulkattendance-job', adminController.addBulkAttendanceJob);
router.post('/add-send-fee-reminder-job', adminController.addSendFeeReminderJob);
router.post('/add-send-message-job', adminController.addSendMessageJob);
router.post('/add-pull-policy-job', isAuth, adminController.postAddPullPolicyJob);
router.post('/add-fetch-home-work-job', isAuth, adminController.postAddFetchHomeWorkJob);



module.exports = router;