const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const extractCommonParams = require('../middleware/extractCommonParams');


router.post('/add-job', adminController.addJob);
router.post('/add-webhook-job', adminController.addWebhookJob);
router.post('/add-bulkattendance-job', adminController.addBulkAttendanceJob);
router.post('/add-send-fee-reminder-job', adminController.addSendFeeReminderJob);
router.post('/add-send-message-job', adminController.addSendMessageJob);
router.post('/add-send-message-bulk-job', adminController.addSendMessageBulkJob);
router.post('/add-pull-policy-job', isAuth, extractCommonParams, adminController.postAddPullPolicyJob);
router.post('/add-fetch-home-work-job', isAuth, extractCommonParams, adminController.postAddFetchHomeWorkJob);
router.post('/add-fetch-messages-job', isAuth, extractCommonParams, adminController.postAddFetchMessagesJob);
router.post('/add-check-user-validity-cached', isAuth, extractCommonParams, adminController.postAddCheckUserValidityCachedJob);
router.post('/add-fetchschooldata', isAuth, extractCommonParams, adminController.postAddFetchSchoolDataJob);
router.post('/add-storefcmtoken', isAuth, extractCommonParams, adminController.postAddStoreFCMTokenJob);
router.post('/add-getcmo-job', isAuth, extractCommonParams, adminController.postAddGetCmoJob);
router.post('/add-getallclasses-job', isAuth, extractCommonParams, adminController.postAddGetAllClassesJob);
router.post('/add-getallsections-job', isAuth, extractCommonParams, adminController.postAddGetAllSectionsJob);
router.post('/add-getsubjects-job', isAuth, extractCommonParams, adminController.postAddGetAllSubjectsJob);
router.post('/add-fetch-public-banks-job', isAuth, extractCommonParams, adminController.postAddFetchPublicBanksJob);
router.post('/add-fetch-student-report-job', isAuth, extractCommonParams, adminController.postAddFetchStudentReportJob);
router.post('/add-online-classes-job', isAuth, extractCommonParams, adminController.postAddOnlineClassesJob);
router.post('/add-online-exams-job', isAuth, extractCommonParams, adminController.postAddOnlineExamsJob);
router.post('/add-getallresultdetails-job', isAuth, extractCommonParams, adminController.postAddGetAllResultDetailsJob);
router.post('/add-student-busid-job', isAuth, extractCommonParams, adminController.postAddStudentBusIdJob);
router.post('/add-transport-settings-app-job', isAuth, extractCommonParams, adminController.postAddTransportSettingsAppJob);
router.post('/add-all-transport-stations-job', isAuth, extractCommonParams, adminController.postAddAllTransportStationsJob);
router.post('/add-update-app-transport-job', isAuth, extractCommonParams, adminController.postAddUpdateAppTransportJob);



module.exports = router;