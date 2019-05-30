let controller = require('../controllers/fcm.controller');
let router = require('express').Router();

router.route('/')
    .post(controller.registerNewFcmToken);

module.exports = router;    
