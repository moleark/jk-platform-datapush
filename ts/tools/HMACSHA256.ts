let crypto = require('crypto');
function HMACSHA256(stringToSign: ArrayBuffer | SharedArrayBuffer, skey: ArrayBuffer | SharedArrayBuffer) {
    //创建Buffer实例 传进加密
    let cskey = Buffer.from(skey);
    let cstringToSign = Buffer.from(stringToSign);
    let hash = crypto.createHmac('sha256', cskey)
        .update(cstringToSign)
        .digest('base64');
    return hash;
}
exports.HMACSHA256 = HMACSHA256;