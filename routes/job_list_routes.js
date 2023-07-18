const router = require('express').Router();
const jobListController = require('../controllers/jobs_list_controllers');

router.get('/', jobListController.jobList);
router.get('/job-detail/:id', jobListController.jobDetail);

module.exports = router;