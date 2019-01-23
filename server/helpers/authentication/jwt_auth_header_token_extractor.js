/**
 * Is used to extract Authorization token from header.
 * You can extend TokenExtractor interface and provide your custom implementation that will
 * extract token from URL
 */

 function extract_token(req) {
    const bearerHeader = req.headers['authorization'];
    if(bearerHeader && bearerHeader.split(' ')[0] === 'Bearer'){
        return bearerHeader.split(' ')[1];
    } else if(req.query && req.query.token) {
        return req.query.token
    }
    return null;
 }
 module.exports = {
     extract_token
 }
