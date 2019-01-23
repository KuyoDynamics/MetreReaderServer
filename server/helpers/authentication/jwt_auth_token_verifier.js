let jwt = require('jsonwebtoken');

function verify_token(req, token) {
    let API_SECRET = process.env.API_SECRET;
    let API_TOKEN_ISSUER = process.env.API_TOKEN_ISSUER;
    let API_TOKEN_ALGORITHM = process.env.API_TOKEN_ALGORITHM;
    let API_TOKEN_EXPIRES_IN = process.env.API_TOKEN_EXPIRES_IN;

    let verifyOptions = {
            issuer: API_TOKEN_ISSUER,
            audience: req.hostname,
            algorithm: [API_TOKEN_ALGORITHM],
            expiresIn: '1h'  
    }
    return new Promise( (resolve, reject)=>{
        let decoded = jwt.decode(token, {complete: true}) ;
        console.log('Token Header: ', decoded.header);
        console.log('Token Payload: ', decoded.payload);
        try {
            
            let result = jwt.verify(token, API_SECRET, verifyOptions);
            
            resolve(result);
    
        } catch (error) {
            console.log('Verify options: ', verifyOptions);
            reject(error);
        }
    });
}

module.exports = {
    verify_token
}