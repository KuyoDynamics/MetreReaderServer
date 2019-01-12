let controller = require('../controllers/auth.controller');

let router = require('express').Router();

router.route('/')
    .get(controller.getNewToken);


module.exports = router;