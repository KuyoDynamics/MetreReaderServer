let mongoose=require('mongoose');
let schema = mongoose.Schema;
let bcrypt = require('bcrypt');
let SALT_WORK_FACTOR = 10;

let FCMTokenSchema = new schema({
    token: {
        type: String,
        unique: true,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        required: true
    }
},{timestamps: true});

//Pre-Save Hook
FCMTokenSchema.pre('save', function(next){
    let token = this;
    //Only Hash the token if it has been modified
    if(!token.isModified){
        return next('token');
    }
    //Generate salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        if(err){
            return next();
        }
        //Hash the token with the new salt
        bcrypt.hash(token.token, salt, function(err, hash){
            if(err){
                return next(err);
            }
            //Override the cleartext token with the hased one
            token.token = hash;
            next();
        });
    });
});

let FcmToken = mongoose.model("FcmToken", FCMTokenSchema);

module.exports = FcmToken;