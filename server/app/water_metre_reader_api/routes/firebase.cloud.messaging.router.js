let controller = require('../controllers/firebase.cloud.messaging.controller');
let router = require('express').Router();

router.route('/')
    .post(controller.addNewFcmToken);
