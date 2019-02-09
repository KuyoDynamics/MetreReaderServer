/* #region comments */
 /** 
 * Things to verify
 * 1. Check that the JWT is well formed
 * 2. Check the signature
 * 3. Validate the standard claims
 * 4. Check the Application permissions(scopes)
 * ///////////////////////////////
 * PARSE THE JWT
 * ////////////////////////
 * First, the API needs to parse the JOSN Web Token(JWT)
 * to make sure it's well formed.
 * If this fails, the token is considered invalid and the request must be rejected.
 * 
 * A well formed JWT, consists of three strings separated by dots(.):
 * the header, the payload and the signature.
 * The header and the payload are Base64Url encoded.
 * The signature is created using these two, a secret and the hashing algorithm being used(as specified in the header: HMAC, SHA256 or RSA)
 * 
 * How can I parse the JWT?
 * ========================
 * In order to parse the JWT you can either manually implement all the checks as described in the
 * specification https://tools.ietf.org/html/rfc7519#section-7.2, or use one of the libraries listed in the Libraries for Token Signing/Verification section of JWT.io
 * 
 * For Example: usingnode-jsonwebtoken library, then you would call the jwt.verify() method.
 * If the parsing fails, then the library will return a JsonWebTokenError error with the message jwt malformed
 * 
 * To check if the signature matches the API's expectations, you have to decode the JWT and retrieve the alg property of the JWT header
 * 
 * The jwt.verify() method of the node-jsonwebtoken library, supports an algorithms argument, that contains a list of strings with the names of the allowed algorithms.
 * 
 * Verify the signature
 * ===================
 * The API needs to verify the signature of each token
 * 
 * This is necessary to verify that the sender of the JWT is who it says it is and to ensure that the message wasn't changed along the way
 * 
 * For HS256, the API's Signing Secret is used
 * For RS26, the tenant's JSON Web Key Set(JWKS) is used.
 * 
 * To verify the signature, you can use one of the libraries available in JWT.io
 * 
 * The jwt.verify() method supports a secretOrPublicKey argument.
 * This should be populated with a string or buffer containing either the secret(for HS256) or the PEM encoded public key(for RS256)
 * 
 * ////////////////////////////
 * Validate the claims
 * ///////////////////////////
 * Once the API verifies the token's signature, the next step is to validate the standard claims of the token's payload
 * 
 * The following validations need to be made:
 * 1. Token expiration
 * -The current date/time must be before the expiration date/time listed in the exp claim(which is a Unix timestamp). If not, the request msut be rejected
 * 
 * 2. Token issuer:
 * -The iss claim denotes the issuer of the JWT
 * -The value must match the one configured in your API.
 * -For JWTs issued by Auth0, iss holds your Auth0 domain with a https:// prefix and a / suffix: https://YOUR_AUTH0_DOMAIN/
 * 
 * 3. Token Audience:
 * -The aud claim identifies the recipients that the JWT is intended for.
 * -For JWTs issued by Auth0, aud holds the unique identifier of the target API(field Identifier)
 * -If the API is not the intended audience of the JWT, it must reject the request.
 * 
 * To velidate the claims, you have to decode the JWT, retrieve the claims(exp, iss, aud) and validate their values
 * 
 * The jwt.verify() method validates these claims, depending on the input arguments:
 * -audience: set aud to the Identifier of the API
 * -issuer: string or array of strings of valid values for the iss field
 * -ignoreExpiration: set to false to validate the expiration of the token
 * 
 * /////////////////////////
 * Check the Permissions
 * ///////////////////////
 * After validating that the JWT is valid.
 * The last step is to verify that the application has the permissions required to access the protected resources.
 * 
 * To do so, you need to check the scopes of the decoded JWT.
 * This claim is part of the payload and it is a space-separated list of strings
 * 
 * For example, a user management API might provide three endpoints to read, create or delete a user record: 
 * /create, /read and /delete.
 * The API can be configured so each endpoint requires a specific permission(or scope):
 * -The read:users scope provides access to the /read endpoint
 * -The create:users scope provides access to the /create endpoint
 * -The delete:users scope provides access to the /delete endpoint
 * 
 * -if a request requests to access the /create endpoint, but the scope calim does NOT include the value create:users, then the API should reject the request with 403 Forbidden
 * 
 * See example here: https://auth0.com/docs/architecture-scenarios/application/server-api/api-implementation-nodejs#check-the-application-permissions
 * 
 * Also see sample implementation here:
 * https://auth0.com/docs/architecture-scenarios/application/server-api/api-implementation-nodejs
 * 
 * and here:
 * https://auth0.com/docs/architecture-scenarios/application/server-api
 *
 */
/* #endregion */
const auth_skip_path_matcher = require('./skip_request_path_matcher');
const {extract_token} = require('./jwt_auth_header_token_extractor');
const {verify_token} = require('./jwt_auth_token_verifier');

async function require_authentication(req, res, next) {
    try {
        let skip = auth_skip_path_matcher(req.path);
        if(skip){
            return next();
        }
        else {
            let token = extract_token(req);
            if(token != null)
            {
                let verified_token = await verify_token(req, token) ;
                if(verified_token){
                    req.user = verified_token;
                    next();
                }
                else{
                    res.status(403);
                    throw new Error('Access forbiden');
                }
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