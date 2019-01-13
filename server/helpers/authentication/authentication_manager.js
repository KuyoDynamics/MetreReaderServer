const auth_skip_path_matcher = require('./skip_request_path_matcher');
const {extract_token} = require('./jwt_header_token_extractor');

async function require_authentication(req, res, next) {
    try {
        let skip = await auth_skip_path_matcher(req.path);
        if( skip === true){
            return next();
        }
        else {
            //Get token from the header
            let token = extract_token(req);

            if(token != null)
            {
                //1. Call method to check if token is expired/invalid
                //2. Call method to verify token signature
                //3. Then call next middleware
                next();
            } else{
                res.status(403);
                throw new Error('Access forbiden');
            }
        }    
    } catch (error) {
        res.status(403);
        return next(error);
    }
}

module.exports = {
    require_authentication
}