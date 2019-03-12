let mongoose=require('mongoose');
let schema = mongoose.Schema;

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

let FcmToken = mongoose.model("FcmToken", FCMTokenSchema);

module.exports = FcmToken;