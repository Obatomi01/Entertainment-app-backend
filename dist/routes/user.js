const express = require('express');

const router = express.Router();

const userController = require('../controllers/user');

router.post('/user/signup', userController.signUpUser);

router.post('/user/login', userController.logInUser);

router.post('/user/request-password-reset', userController.requestPasswordReset);

router.put('/user/reset-password', userController.resetPassword);

module.exports = router;