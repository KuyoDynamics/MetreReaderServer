let FcmToken = require('../models/fcm.token');
let User = require('../models/user.model');

//GET /api/fcmtoken/:id
async function getFcmToken(req, res, next){
    try {
        let token_id = req.params.id;
        const fcm_token = await FcmToken.findById(token_id);
        if(fcm_token ===  null){
            res.status(404);
            next(new Error("Token not found"));
        }
        else{
            res.status(200).send(fcm_token);
            return;
        }        
    } catch (error) {
        console.log(error);
        return next(error);        
    }
}

//POST /api/fcmtoken/
async function registerNewFcmToken(req, res, next) {
    let session;
    try {
        session = await User.startSession();
        let fcm_token = new FcmToken({
            token: req.body.token,
            user_id: req.body.user_id
        });
        session.startTransaction();

        const ops = { session };

        await fcm_token.validate();
        console.log('[metre_reader_server] Fcm token data fields for ', fcm_token._id, ' successfully passed validation!');
        //1. Save token to DB
        const result = await fcm_token.save(ops);
        console.log('[metre_reader_server] New Fcm token with id: ', fcm_token._id, ' was successfully created!');
        //2. Subscribe to fcm user's group
        
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