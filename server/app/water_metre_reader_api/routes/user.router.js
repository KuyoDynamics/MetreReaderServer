let router = require('express').Router();
let controller = require('../controllers/user.controller');
let verify_auth_scope = require('../../../helpers/authentication/jwt_auth_scope_verifier');

console.log("Routed  to : /:id");
//Also apply middleware to only allow admins to view/retrieve other users' info
//If report viewer, view non-identifiable info only and readonly
//If field_agent, view only your info
//Call middleware, verify_auth_role
router.route('/:id')
    .get(verify_auth_scope(['read:users']), controller.getUser)
router.route('/')
    .post(verify_auth_scope(['create:users']), controller.createUser)

module.exports = router;    
