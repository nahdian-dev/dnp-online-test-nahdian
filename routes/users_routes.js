const router = require('express').Router();

const userControllers = require('../controllers/users_controller');

router.post('/register', userControllers.userRegister);
router.get('/login', userControllers.userLogin);

module.exports = router;
