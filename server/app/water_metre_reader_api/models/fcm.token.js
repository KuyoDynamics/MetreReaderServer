let mongoose=require('mongoose');
let schema = mongoose.Schema;
let text_encryption = require('../../../helpers/authentication/text_encryption');

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
    //Only encrypt the token if it has been modified
    if(!token.isModified){
        return next('token');
    }
    //Do Not Hash Salt, just Encrypt! Hashing is good for passwords
    try {
        token.token = text_encryption.encrypt(token.token);
        next();
    } catch (error) {
        console.log('Error encrypting token: ', error);
        next(error);        
    }
});
//Post-find Hook
FCMTokenSchema.post('find', function(token){
    //Decrypt token
    try {
        this.token = text_encryption.decrypt(this.token);
        next();        
    } catch (error) {
        console.log('Error Decrypting token: ', error);
        next(error);    
    }
})

let FcmToken = mongoose.model("FcmToken", FCMTokenSchema);

module.exports = FcmToken;