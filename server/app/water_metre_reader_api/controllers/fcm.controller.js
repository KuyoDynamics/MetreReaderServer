let FcmToken = require('../models/fcm.token');

async function addNewFcmToken(req, res, next) {
    const session = await User.startSession();
    try {
        let fcm_token = new FcmToken({
            token: req.body.token,
            user_id: req.body.user_id
        });
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
    addNewFcmToken
}