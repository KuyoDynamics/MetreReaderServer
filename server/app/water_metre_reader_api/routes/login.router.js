let router = require('express').Router();
let controller = require('../controllers/login.controller');
let {jwt_new_token_provider} = require('../../../helpers/authentication/jwt_login_token_provider');
console.log('Routed to /login');

router.route('/')
    .post(controller.login, jwt_new_token_provider);


module.exports = router;
