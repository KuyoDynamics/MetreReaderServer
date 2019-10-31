let User = require('../models/user.model');

//GET /api/fcmtoken/:id
async function getFcmTokens(req, res, next){
    try {
        let user_id = req.params.id;
        const user = await User.findById(user_id);
        if(user ===  null){
            res.status(404);
            next(new Error("User not found"));
        }
        else{
            res.status(200).send(user.fcm_tokens);
            return;
        }        
    } catch (error) {
        console.log(error);
        return next(error);        
    }
}

//POST /api/fcmtoken/
async function registerNewFcmToken(req, res, next) {
    let session = null;
    UserSchema.pre('save', function(next){
        var  fcm_token = this;
        if(!fcm_token.isModified){
            return next('token');
        }
        try {
            fcm_token.token = text_encryption.encryptText(fcm_token.token);
            next();
        } catch (error) {
            console.log('Error encrypting token: ', error);
            next(error);        
        }
    });
    try {
        session = User.db.startSession();
        session.startTransaction();

        const ops = { session };
        //1. Save token to DB
        const result = await User.findOneAndUpdate({_id: req.body.user_id}, {$addToSet: {fcm_tokens: req.body.token}},ops);
        console.log('[metre_reader_server] New Fcm token with id: ', result.fcm_tokens[req.body.token], ' was successfully created!');
        await session.commitTransaction();
        session.endSession();

        res.status(201).send({
            message: 'Record created successfully',
			record: result
        });
        return;
    } catch (error) {
        await session.abortTransaction();
		console.log('[metre_reader_server] Transaction aborted!');
		session.endSession();
		console.log('[metre_reader_server] Transaction ended!');
		res.status(422); //422 is Unprocessed Entity
		return next(error);
    }    
}

module.exports = {
    registerNewFcmToken,
    getFcmToken
}