let router = require('express').Router();
let controller = require('../controllers/user.controller');

router.route('/:id')
    .get(controller.getUser);

module.exports = router;    
