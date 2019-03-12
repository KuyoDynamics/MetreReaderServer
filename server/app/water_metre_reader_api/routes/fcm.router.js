let controller = require('../controllers/fcm.controller');
let router = require('express').Router();

router.route('/')
    .post(controller.addNewFcmToken);

module.exports = router;    
