/**
 * The objectives of the username/password authentication implementation:
 * 1. The User model should fully encapsulate the password encryption and verification logic
 * 2. The User model should ensure that the password is always encrypted before saving
 * 3. The User model should be resistant to program logic errors, like double-encrypting 
 * the password on user updates. bcrypt interactions should be performed asynchronously 
 * to avoid blocking the event loop(bcrypt also exposes a synchronous API)
 * 
 * There are a couple things to be aware of though: Because passwords are not hashed until 
 * the document is saved, be careful if you’re interacting with documents that were not 
 * retrieved from the database, as any passwords will still be in cleartext. 
 * Mongoose middleware is not invoked on update() operations, so you must use a save()
 * if you want to update user passwords. 
 */
let mongoose = require('mongoose');
let bcrypt = require('bcrypt');
let SALT_WORK_FACTOR = 10;
//max of 5 attempts resulting in a 2 hour lock
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2*60*60*1000;

let Schema = mongoose.Schema;
let UserTypeOptions = ['field_agent','web_user'];
let SexTypeOptions = ['male','female','unknown'];
let UserRoleOptions = ['data_collector','read_only','billing_admin','app_manager','app_editor']

let UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        index: {unique: true}
    },
    password: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
	sex: { 
		type: String, 
		enum: SexTypeOptions, 
		lowercase: true,
		trim: true,
		required: true
    },
    date_of_birth: {
        type: String,
        required: true
    },
    user_type: {
        type: String,
        enum: UserTypeOptions
    },
    user_role: {
        type: String,
        enum: UserRoleOptions
    },
    login_attempts: {
        type: Number,
        required: true,
        default: 0
    } ,
    lock_until: {
        type: Number
    }
}, {timestamps: true});

//Pre Save Hook
UserSchema.pre('save', function(next) {
    let user = this;
    // only hash the password if it has been modified (or is new)
    if(!user.isModified('password')){
        return next();
    }
    //generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if(err) {
            return next(err);
        }
        //hash the password along with our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if(err) {
                return next(err);
            }
            // Override the cleartext password with the hashed one
            user.password = hash;
            next();
        })
    })
});
//Add Password Verification Middleware
UserSchema.methods.comparePassword =  function(candidatePassword, callback){
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch){
        if(err){
            return callback(err);
        }
        callback(null, isMatch);
    });
};

//increment login attempts
UserSchema.methods.incLoginAttempts = function(callback){
    //if we have a previous lock that has expired, restart at 1
    if(this.lock_until && this.lock_until < Date.now()){
        return this.update({
            $set: { login_attempts: 1},
            $unset: { lock_until: 1}
        }, callback);
    }
    //otherwise we're incrementing
    let updates =  {$inc: {login_attempts: 1}};
    //lock the account if we've reached max attempts and its not locked already
    if(this.login_attempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked){
        updates.$set = { lock_until: Date.now() + LOCK_TIME};
    }
    return this.update(updates, callback);
};
//expose enum on the model and provide an internal convenience reference
let reasons = UserSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
}
//Virtuals
UserSchema.virtual('isLocked').get(function(){
    //check for a future lockUntil timestamp
    return !!(this.lock_until && this.lock_until > Date.now());
});

UserSchema.static.getAuthenticated = function(username, password, callback){
    this.findOne({username: username}, function(err, user){
        if(err){
            return callback(err);
        }

        //make sure user exists
        if(!user){
            return callback(null, null, reasons.NOT_FOUND);
        }
        //check if the account is currently locked
        if(user.isLocked){
            //just increment login attempts if account is already locked
            return user.incLoginAttempts(function(err){
                if(err) {
                    return callback(err);
                }
                return callback(null, null, reasons.MAX_ATTEMPTS);
            });
        }

        //test for a matching password
        user.comparePassword(password, function(err, isMatch){
            if(err){
                return callback(err);
            }
            //check if the password was a match
            if(isMatch){
                //if there is no lock or failed attempts, just return the user
                if(!user.login_attempts && !user.lock_until){
                    return callback(null, user);
                }
                //reset attempts and lock info
                let updates = {
                    $set: { login_attempts: 0},
                    $unset: { lock_until: 1}
                };
                return user.update(updates, function(err){
                    if(err){
                        return callback(err);
                    }
                    return callback(null, user);
                });
            }
            //password is incorrect, so increment login attempts before responding
            user.incLoginAttempts(function(err) {
                if(err){
                    return callback(err);
                }
                return callback(null, null, reasons.PASSWORD_INCORRECT);
            });
            
        });
    });
}

let User = mongoose.model('User', UserSchema);

User.init(function(User){
    mongoose.connection.createCollection('users');
})

module.exports = User;