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
let UserTypeOptions = ['field_agent','system_admin','report_viewer'];
let SexTypeOptions = ['male','female','unknown'];
let UserPermissions = ['read:users','create:users','update:users','delete:users','read:metre_accounts'];

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
    user_permissions: [{
        type: String,
        enum: UserPermissions
    }],
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
UserSchema.methods.comparePassword =  function(candidatePassword, userPassword){
    return new Promise(function(resolve, reject){
        bcrypt.compare(candidatePassword, userPassword, function(err, isMatch){
            if(err){
                return reject(err);
            }
            return resolve(isMatch);
        });
    });    
};

//increment login attempts
UserSchema.methods.incLoginAttempts = function(callback){
    //if we have a previous lock that has expired, restart at 1
    if(this.lock_until && this.lock_until < Date.now()){
        return this.updateOne({
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
    return this.updateOne(updates, callback);
};
//expose enum on the model
UserSchema.statics.failedLoginReasons = {
    NOT_FOUND: 'user not found',
    PASSWORD_INCORRECT: 'incorrect password',
    MAX_ATTEMPTS: 'maximum login attempts reached'
}
//Virtuals
UserSchema.virtual('isLocked').get(function(){
    //check for a future lockUntil timestamp
    return !!(this.lock_until && this.lock_until > Date.now());
});

let User = mongoose.model('User', UserSchema);

User.init(function(User){
    mongoose.connection.createCollection('users');
})

module.exports = User;