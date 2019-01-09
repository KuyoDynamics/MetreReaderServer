let router = require('express').Router();
let controller = require('../controllers/user.controller');
console.log("Routed  to : /:id");
router.route('/:id')
    .get(controller.getUser)
router.route('/')
    .post(controller.createUser)

module.exports = router;    
