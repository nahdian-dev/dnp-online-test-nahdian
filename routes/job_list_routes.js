const router = require('express').Router();
const jobListController = require('../controllers/jobs_list_controllers');

router.get('/', jobListController.jobList);

module.exports = router;