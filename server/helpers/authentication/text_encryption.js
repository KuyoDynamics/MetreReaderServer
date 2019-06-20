//Encryption with CTR
let crypto = require('crypto');

let CRYPTO_ALGORITHM = process.env.CRYPTO_ALGORITHM;
let CRYPTO_PASSWORD = process.env.CRYPTO_PASSWORD;

function encrypt(text){
    let cipher =  crypto.createCipher(CRYPTO_ALGORITHM,CRYPTO_PASSWORD);
    let encrypted = cipher.update(text, 'utf8','hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decrypt(text){
    let decipher = crypto.createDecipher(CRYPTO_ALGORITHM, CRYPTO_PASSWORD);
    let decrypted  = decipher.update(text,'hex','utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = {
    encrypt,
    decrypt
}