//Encryption with CTR
const crypto = require('crypto');

var CRYPTO_ALGORITHM = '';
var CRYPTO_PASSWORD = '';
CRYPTO_ALGORITHM = process.env.CRYPTO_ALGORITHM;
CRYPTO_PASSWORD = process.env.CRYPTO_PASSWORD;
//Use the async 'crypto.scrypt()' instead
const KEY = crypto.scryptSync(String(process.env.CRYPTO_PASSWORD), 'salt',24);
//The IV is usually passed along with the ciphertext
// Use `crypto.randomBytes` to generate a random iv instead of the static iv
// shown here.
const IV = Buffer.alloc(16,0); //Initialization vector

function encryptText(text){
    const cipher =  crypto.createCipheriv(String(process.env.CRYPTO_ALGORITHM), KEY, IV);

    let encrypted = cipher.update(text, 'utf8','hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decryptText(text){
    const  decipher = crypto.createDecipheriv(String(process.env.CRYPTO_ALGORITHM), KEY, IV);
    let decrypted  = decipher.update(text,'hex','utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = {
    encryptText,
    decryptText
}