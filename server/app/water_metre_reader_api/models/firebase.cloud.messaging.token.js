let mongoose=require('mongoose');
let schema = mongoose.Schema;

let FCMTokenSchema = new schema({
    token: mongoose.Schema.Types.ObjectId,
    user_id: ObjectId
},{timestamps: true});

let FcmToken = mongoose.model("FcmToken", FCMTokenSchema);

module.exports = FcmToken;