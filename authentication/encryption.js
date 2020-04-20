const secretKey = require('../config').secretKey;
const crypto = require('crypto');

module.exports.ecrypt = function (text) {
    let cipher  = crypto.createCipher('aes-128-cbc', secretKey);
    return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

module.exports.decrypter = function (text) {
    var decipher  = crypto.createDecipher('aes-128-cbc', secretKey);
    return decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
}



