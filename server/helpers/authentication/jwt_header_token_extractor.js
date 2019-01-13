/**
 * Is used to extract Authorization token from header.
 * You can extend TokenExtractor interface and provide your custom implementation that will
 * extract token from URL
 */

 function extract_token(req) {
    const bearerHeader = req.headers['authorization'];
    let token = null;
    console.log('Bearer Header: ', bearerHeader);
    if(bearerHeader){
        //split at the space
        const bearer = bearerHeader.split(' ');
        //Get token from the bearer
        token = bearer[1];
    }
    return token;
 }
 module.exports = {
     extract_token
 }
