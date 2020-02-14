"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
let md5 = require('md5');
//import  * as md5  from "md5";
async function validationData(timestamp, checkKey) {
    let key = "5dc43a6464ccec1d8c35a946e4cbfea1"; //签名key,提供给摩贝的签名 
    /*
    contenttype: 传送数据的格式，要求 application/json;
    timestamp：时间，平台方传过来的时间格式；
    checkKey：签名MD5(签名Key + timestamp)，平台方传过来；
    //摩贝签名验证规则:MD5( key + timestamp ) 的结果与 checkKey 进行比对是否一致？ 一致则通过，不一致则签名验证失败；
    */
    //检测参数是否正确
    if (timestamp == '' || util_1.isNullOrUndefined(timestamp)) {
        return false;
    }
    if (checkKey == '' || util_1.isNullOrUndefined(checkKey)) {
        return false;
    }
    //签名验证，转换为大写进行判断
    let md5Str = md5(key + timestamp);
    if (md5Str.toUpperCase() != checkKey.toUpperCase()) {
        return false;
    }
    return true;
}
exports.validationData = validationData;
//# sourceMappingURL=validationData.js.map