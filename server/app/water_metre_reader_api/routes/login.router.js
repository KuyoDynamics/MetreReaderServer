let router = require('express').Router();
let controller = require('../controllers/login.controller');
console.log('Routed to /login');

router.route('/')
    .post(controller.login);


module.exports = router;
