let User = require('../models/user.model');

//POST /api/login?username="username"&password="password"
async function login(req, res, next) {
    let username = req.body.username || req.params.username;
    let password = req.body.password || req.params.password;

    try {
        //fetch user and test for password equality
        let user = await User.findOne({username: username});
        let reasons =  User.failedLogin;

        //check if the account is currently locked
        if(user.isLocked){
            //just increment login attempts if account is already locked
            return user.incLoginAttempts(function(err){
                if(err) {
                    return next(err);
                }
                return next(reasons.MAX_ATTEMPTS);
            });
        }
        
        if(user){
            //test for a matching password
            user.comparePassword(password, function(err, isMatch){
                if(err){
                    //Not Authorized
                    return next(err);
                }
                if(!isMatch){
                    //Not Authorized
                    //password is incorrect, so increment login attempts before responding
                    user.incLoginAttempts(function(err) {
                        if(err){
                            return next(err);
                        }
                        return next(new Error(reasons.PASSWORD_INCORRECT));
                    });
                }
                if(isMatch){
                    //if there is no lock or failed attempts, just return the user
                    if(!user.login_attempts && !user.lock_until){
                        return next(null, user);
                    }
                    //reset attempts and lock info
                    let updates = {
                        $set: { login_attempts: 0},
                        $unset: { lock_until: 1}
                    };

                    let updated_user = await User.updateOne({'_id': user._id}, updates);
                    return next(null, updated_user);
                }
                
            });
        }
        else {
             //Not Authorized
            return next(new Error("Invalid username or password"));
        }
    } catch (error) {
        
        return next(error);
    }
}

module.exports = {
    login
}