let FcmToken = require('../models/fcm.token');
let User = require('../models/user.model');
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

        const result = await fcm_token.save(ops);
        console.log('[metre_reader_server] New Fcm token with id: ', fcm_token._id, ' was successfully created!');

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
    registerNewFcmToken
}