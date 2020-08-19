"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uq_joint_1 = require("uq-joint");
const date_fns_1 = require("date-fns");
let md5 = require('md5');
const config_1 = __importDefault(require("config"));
const logger_1 = require("../../tools/logger");
const HttpRequestHelper_1 = require("../../tools/HttpRequestHelper");
const util_1 = require("util");
const globalVar_1 = require("../../tools/globalVar");
// 库巴扎接口相关配置
const cobazaarApiSetting = config_1.default.get("cobazaarApi");
function getTokenInfo(hostname, gettokenPath, loginname, ukey) {
    let vcode = md5(loginname + ukey + 'kbz');
    let result = {};
    let options = {
        hostname: hostname,
        path: gettokenPath,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8;'
        }
    };
    let postData = { "loginname": loginname, "ukey": ukey, "vcode": vcode };
    let optionData = HttpRequestHelper_1.HttpRequest_POST(options, postData);
    let postResult = JSON.parse(String(optionData));
    if (postResult.flag != 1) {
        throw ('获取token失败');
    }
    else {
        result = postResult.rdate;
        globalVar_1.GlobalVar.token = result[0].token;
        globalVar_1.GlobalVar.ucode = result[0].ucode;
        globalVar_1.GlobalVar.timestamp = result[0].timestamp;
    }
}
async function CobazaarPullWrite(joint, uqIn, data) {
    let { key, mapper, uq: uqFullName, entity: tuid } = uqIn;
    if (key === undefined)
        throw 'key is not defined';
    if (uqFullName === undefined)
        throw 'tuid ' + tuid + ' not defined';
    let keyVal = data[key];
    //let mapToUq = new MapToUq(this);
    let mapToUq = new uq_joint_1.MapUserToUq(joint);
    let body = await mapToUq.map(data, mapper);
    console.log(globalVar_1.GlobalVar.timestamp);
    let { loginname, ukey, hostname, gettokenPath, delproductPath, addproduct } = cobazaarApiSetting;
    try {
        let result = false;
        let recordTime = date_fns_1.format(Date.now(), 'yyyy-MM-dd HH:mm:ss'); // + 8 * 3600 * 1000
        if (util_1.isNullOrUndefined(globalVar_1.GlobalVar.token) || util_1.isNullOrUndefined(globalVar_1.GlobalVar.ucode) || util_1.isNullOrUndefined(globalVar_1.GlobalVar.timestamp) || date_fns_1.differenceInHours(globalVar_1.GlobalVar.timestamp, Date.now()) > 50) {
            await getTokenInfo(hostname, gettokenPath, loginname, ukey);
        }
        else {
            let { 品牌, 货号, 包装规格, 产品分类, 中文名称, 英文名称, 目录价, CAS, 交货期, 纯度, 保存条件, MDL, typeId, stateName, isDelete } = body;
            let postDataStr = {};
            let postOptions = {
                hostname: hostname,
                path: '',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                }
            };
            if (isDelete == 1) {
                let deleteData = {
                    rid: body["rid"],
                    isinsale: 0
                };
                postDataStr = JSON.stringify(deleteData);
            }
            else {
                let addData = {
                    product: '',
                    productType: '',
                    vipCode: '',
                    platform: '',
                    appSecurity: '',
                    version: ''
                };
                postDataStr = JSON.stringify(addData);
            }
            // 调用平台的接口推送数据，并返回结果 
            let optionData = await HttpRequestHelper_1.HttpRequest_POST(postOptions, postDataStr);
            let postResult = JSON.parse(String(optionData));
            if (postResult.flag == 0) {
                result = false;
                console.log('cobazaarPush Fail: { PackageId: ' + body["COMPANY_SALE_NO"] + ',Type:' + postOptions.path + ',Datetime:' + recordTime + ',Message:平台不存在无需删除');
            }
            else {
                result = true;
                console.log('cobazaarPush Success: { PackageId: ' + body["COMPANY_SALE_NO"] + ',Type:' + postOptions.path + ',Datetime:' + recordTime + ',Message:平台不存在无需删除');
            }
        }
        return result;
    }
    catch (error) {
        logger_1.logger.error(error);
        throw error;
    }
}
exports.CobazaarPullWrite = CobazaarPullWrite;
//# sourceMappingURL=cobazaarPullWrite.js.map