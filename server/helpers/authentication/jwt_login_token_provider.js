const jwt = require('jsonwebtoken');

async function jwt_new_token_provider(req, res, next) {
    try {
        let user = req.user;
        let API_SECRET = process.env.API_SECRET;

        let token = await jwt.sign({user}, API_SECRET, {expiresIn: '30s'});
        res.json({
            token
        });
        
        res.status(200).send();
        return;    
    } catch (error) {
        next(error);        
    }    
}

module.exports = {
    jwt_new_token_provider
}