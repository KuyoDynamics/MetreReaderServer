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
    var  fcm_token = this;
    var token_val = this.token.toString();
    if(!fcm_token.isModified){
        return next('token');
    }
    try {
        fcm_token.token = text_encryption.encryptText(token_val);
        next();
    } catch (error) {
        console.log('Error encrypting token: ', error);
        next(error);        
    }
});
//Post-find Hook
FCMTokenSchema.post('findOne', function(doc, next){
    //Decrypt token
    try {
        doc.token = text_encryption.decryptText(doc.token);
        console.log('Post find decrypted token: ', doc.token);
        next();        
    } catch (error) {
        console.log('Error Decrypting token: ', error);
        next(error);    
    }
})

let FcmToken = mongoose.model("FcmToken", FCMTokenSchema);

module.exports = FcmToken;