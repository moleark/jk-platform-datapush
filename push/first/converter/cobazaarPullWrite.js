"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uq_joint_1 = require("uq-joint");
const date_fns_1 = require("date-fns");
const md5 = require('md5');
const config_1 = __importDefault(require("config"));
const logger_1 = require("../../tools/logger");
const HttpRequestHelper_1 = require("../../tools/HttpRequestHelper");
const util_1 = require("util");
const globalVar_1 = require("../../tools/globalVar");
let qs = require('querystring');
// 库巴扎接口相关配置
const cobazaarApiSetting = config_1.default.get("cobazaarApi");
// 获取Token接口信息
async function getTokenInfo(hostname, gettokenPath, loginname, ukey) {
    let vcode = md5(loginname + ukey + 'kbz');
    let requestData = qs.stringify({
        'loginname': loginname,
        'ukey': ukey,
        'vcode': vcode
    });
    let options = {
        method: 'POST',
        hostname: hostname,
        path: gettokenPath + '?',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        maxRedirects: requestData.length
    };
    let optionData = await HttpRequestHelper_1.HttpRequest_POST(options, requestData);
    let postResult = JSON.parse(String(optionData));
    if (postResult.flag != 1) {
        throw ('获取token失败');
    }
    else {
        console.log(String(optionData));
        let result = postResult.rdate;
        globalVar_1.GlobalVar.token = result[0].token;
        globalVar_1.GlobalVar.ucode = result[0].ucode;
        globalVar_1.GlobalVar.timestamp = result[0].timestamp;
    }
}
// 获取产品类型
function GetProductType(typeId) {
    let result = '';
    switch (typeId) {
        case 1:
            result = '化学试剂';
            break;
        case 2:
            result = '生物试剂';
            break;
        case 3:
            result = '仪器耗材';
            break;
    }
    return result;
}
// 获取到货期
function GetFutureDelivery(amount, brandName, deliveryCycle) {
    let result = 3;
    if (amount > 0) {
        result = 1;
    }
    else {
        if (brandName == 'Acros') {
            result = 2;
        }
        else if (brandName == 'TCI') {
            result = 2;
        }
        else if (brandName == 'Alfa') {
            result = 2;
        }
        else {
            result = deliveryCycle;
        }
    }
    return result;
}
// 获取品牌名称（平台上维护的品牌有些与我司数据库中名称有差异）
function GetBrandName(brandName) {
    let result = "";
    if (brandName == "J&K") {
        result = '百灵威J&K';
    }
    else if (brandName == "Alfa") {
        result = 'Alfa Aesar';
    }
    else {
        result = brandName;
    }
    return result;
}
// 获取产品链接地址
function GetDetaUrl(JKid) {
    let result = '';
    result = 'https://www.jkchemical.com/CH/Products/' + JKid + '.html';
    return result;
}
// 获取删除格式数据
function GetDeleteFormat(brandName, originalId, packageSize) {
    return [{
            '品牌': GetBrandName(brandName),
            '货号': originalId,
            '包装规格': packageSize
        }];
}
// 获取新增或者修改格式数据
function GetAddOrEditFormat(brandName, originalId, packageSize, chineseName, englishName, catalogPrice, CAS, deliveryCycle, purity, MDL, jkid, typeId, stock) {
    return [{
            '品牌': GetBrandName(brandName),
            '货号': originalId,
            '包装规格': packageSize,
            '产品分类': GetProductType(typeId),
            '中文名称': chineseName,
            '英文名称': englishName,
            '目录价(RMB)': catalogPrice,
            'CAS': CAS,
            '质量等级': '',
            '包装单位': '瓶',
            '交货期': GetFutureDelivery(stock, brandName, deliveryCycle),
            '纯度': purity,
            '保存条件': '',
            '运输条件': '',
            '中文别名': '',
            '英文别名': '',
            '关键词': '',
            '其他描述': '',
            'MDL': MDL,
            '链接地址': GetDetaUrl(jkid)
        }];
}
// 推送
async function CobazaarPullWrite(joint, uqIn, data) {
    let { key, mapper, uq: uqFullName, entity: tuid } = uqIn;
    if (key === undefined)
        throw 'key is not defined';
    if (uqFullName === undefined)
        throw 'tuid ' + tuid + ' not defined';
    let keyVal = data[key];
    let mapToUq = new uq_joint_1.MapUserToUq(joint);
    let body = await mapToUq.map(data, mapper);
    let { loginname, ukey, hostname, gettokenPath, delproductPath, addproductPath } = cobazaarApiSetting;
    let { brandName, originalId, packageSize, chineseName, englishName, catalogPrice, CAS, deliveryCycle, stock, purity, MDL, jkid, typeId, stateName, isDelete } = body;
    let result = false;
    try {
        // 判断有没有获取到token信息
        if (util_1.isNullOrUndefined(globalVar_1.GlobalVar.token) || util_1.isNullOrUndefined(globalVar_1.GlobalVar.ucode) || util_1.isNullOrUndefined(globalVar_1.GlobalVar.timestamp)) {
            await getTokenInfo(hostname, gettokenPath, loginname, ukey);
        }
        // 判断获取到的token信息有没有过期（接口token有效时间60分钟，此处设置为超过50分钟则重新获取）
        if (date_fns_1.differenceInHours(new Date(globalVar_1.GlobalVar.timestamp), Date.now()) > 50) {
            await getTokenInfo(hostname, gettokenPath, loginname, ukey);
        }
        let postDataStr = {};
        let postOptions = {
            hostname: hostname,
            path: '',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            }
        };
        if (String(isDelete) == '1') {
            let deleteData = await GetDeleteFormat(brandName, originalId, packageSize);
            postOptions.path = delproductPath;
            postDataStr = JSON.stringify(deleteData);
        }
        else {
            let addData = await GetAddOrEditFormat(brandName, originalId, packageSize, chineseName, englishName, catalogPrice, CAS, deliveryCycle, purity, MDL, jkid, typeId, stock);
            postOptions.path = addproductPath;
            postDataStr = JSON.stringify(addData);
        }
        let requestData = qs.stringify({
            ucode: globalVar_1.GlobalVar.ucode,
            token: globalVar_1.GlobalVar.token,
            timestamp: globalVar_1.GlobalVar.timestamp,
            reqcontent: postDataStr
        });
        // 调用平台的接口推送数据，并返回结果
        let optionData = await HttpRequestHelper_1.HttpRequest_POST(postOptions, requestData);
        let postResult = JSON.parse(String(optionData));
        if (postResult.flag == 0) {
            result = false;
            throw 'cobazaarPush Fail: { Id: ' + keyVal + ',Type:' + postOptions.path + ',Datetime:' + date_fns_1.format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message: ' + optionData;
        }
        else {
            result = true;
            console.log('cobazaarPush Success: { Id: ' + keyVal + ',Type:' + postOptions.path + ',Datetime:' + date_fns_1.format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message: ' + optionData);
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