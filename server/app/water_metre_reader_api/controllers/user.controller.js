let User =  require('../models/user.model');

//GET api/users/:id
async function getUser(req, res, next) {
    let user_id = req.params.id;
    try {
        const user =  await User.findById(user_id);
        res.status(200).send(user);
        return;
    } catch (error) {
        console.log(error);
        return next(error);        
    }
};

module.exports = {
    getUser
}
