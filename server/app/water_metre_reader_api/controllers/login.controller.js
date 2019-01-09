let User = require('../models/user.model');

//POST /api/login?username="username"&password="password"
async function login(req, res, next) {
    let username = req.body.username || req.query.username;
    let password = req.body.password || req.query.password;

    console.log('username: ', username);
    console.log('Query: ', req.query);
    console.log('Body: ', req.body);
    
    let reasons =  User.failedLogin;

    try {
        //fetch user and test for password equality
        let user = await User.findOne({'username': username});
        
        if(user){
            //check if the account is currently locked
            if(user.isLocked){
                //just increment login attempts if account is already locked
                user.incLoginAttempts(function(err) {
                    if(err){
                        console.log('Error incrementing login attempts: ', err);
                    }
                });
                throw new Error(reasons.MAX_ATTEMPTS);
            }
            //test for a matching password
            let isMatch = await user.comparePassword(password, user.password);
            console.log('isMatch: ', isMatch);
            if(!isMatch){
                //password is incorrect, so throw new error and increment login
                user.incLoginAttempts(function(err) {
                    if(err){
                        console.log('Error incrementing login attempts: ', err);
                    }
                });
                throw new Error(reasons.PASSWORD_INCORRECT);
            }
            if(isMatch){
                //if there is no lock or failed attempts, just return the user
                if(!user.login_attempts && !user.lock_until){
                    res.status(200);
                    res.send(user);
                    return;
                    // return next(null, user);
                }
                //reset attempts and lock info
                let updates = {
                    $set: { login_attempts: 0},
                    $unset: { lock_until: 1}
                };

                let updated_user = await User.findOneAndUpdate({'_id': user._id}, updates,{"new": true});
                res.status(200);
                res.send(updated_user);
                // return next(null, updated_user);
                return;
            }
        }
        else {
            //get clever and deny that IP further requests for 24hrs, i.e, rate limit
            throw new Error(reasons.NOT_FOUND);
        }
    } catch (error) {
        res.status(401);
        return next(error);
    }
}

module.exports = {
    login
}