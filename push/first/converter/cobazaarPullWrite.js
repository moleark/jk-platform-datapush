"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CobazaarPullWrite = void 0;
const uq_joint_1 = require("uq-joint");
//import { Joint, UqInTuid, UqIn, Tuid, MapUserToUq } from "../../uq-joint";
const date_fns_1 = require("date-fns");
const md5 = require('md5');
const config_1 = __importDefault(require("config"));
const logger_1 = require("../../tools/logger");
const HttpRequestHelper_1 = require("../../tools/HttpRequestHelper");
const stringUtils_1 = require("../../tools/stringUtils");
const globalVar_1 = require("../../tools/globalVar");
const lodash_1 = require("lodash");
const matching_1 = require("../../tools/matching");
let qs = require('querystring');
// 库巴扎接口相关配置
const cobazaarApiSetting = config_1.default.get("cobazaarApi");
/**
 * 推送
 * @param joint
 * @param uqIn
 * @param data
 * @returns
 */
async function CobazaarPullWrite(joint, uqIn, data) {
    let { key, mapper, uq: uqFullName, entity: tuid } = uqIn;
    if (key === undefined)
        throw 'key is not defined';
    if (uqFullName === undefined)
        throw 'tuid ' + tuid + ' not defined';
    let keyVal = data[key];
    let mapToUq = new uq_joint_1.MapUserToUq(joint);
    let body = await mapToUq.map(data, mapper);
    let { loginname, ukey, hostname, gettokenPath, delproductPath, addproductPath, addproductPricePath } = cobazaarApiSetting;
    let { brandName, originalId, packageSize, chineseName, englishName, catalogPrice, CAS, deliveryCycle, stock, purity, MDL, jkid, typeId, stateName, isDelete, discount, activeDiscount, salePrice, pEndTime, isHazard, packnr, quantity, unit } = body;
    let result = false;
    try {
        // 判断有没有获取到token信息
        if (stringUtils_1.StringUtils.isEmpty(globalVar_1.GlobalVar.token) || stringUtils_1.StringUtils.isEmpty(globalVar_1.GlobalVar.ucode) || stringUtils_1.StringUtils.isEmpty(globalVar_1.GlobalVar.timestamp)) {
            await getTokenInfo(hostname, gettokenPath, loginname, ukey);
        }
        // 判断获取到的token信息有没有过期（接口token有效时间120分钟，此处设置为超过100分钟则重新获取）
        let strattTime = new Date(globalVar_1.GlobalVar.timestamp);
        let endTime = new Date(Date.now() + 60000);
        let diffMinutes = lodash_1.round((endTime - strattTime) / (1000 * 60));
        if (diffMinutes > 100) {
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
        else if (String(isDelete) == '0' && stringUtils_1.StringUtils.isNotEmpty(activeDiscount)) {
            let promotionData = await GetCuXiaoFormat(brandName, originalId, packageSize, chineseName, englishName, catalogPrice, activeDiscount, CAS, deliveryCycle, purity, MDL, jkid, typeId, stock, pEndTime, packnr, quantity, unit);
            postOptions.path = addproductPricePath;
            postDataStr = JSON.stringify(promotionData);
        }
        else {
            let addData = await GetAddOrEditFormat(brandName, originalId, packageSize, chineseName, englishName, catalogPrice, CAS, deliveryCycle, purity, MDL, jkid, typeId, stock, packnr, quantity, unit);
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
            // 如果是危险品数据重新推送给苏州大学，增加10块
            // console.log(isHazard);
            if (isHazard == true && String(isDelete) == '0' && stringUtils_1.StringUtils.isEmpty(activeDiscount)) {
                let sudaData = await GetWeiXianFormatForSuDa(brandName, originalId, packageSize, chineseName, englishName, catalogPrice, CAS, deliveryCycle, purity, MDL, jkid, typeId, stock, packnr, quantity, unit);
                postDataStr = JSON.stringify(sudaData);
                let requestDataAgain = qs.stringify({
                    ucode: globalVar_1.GlobalVar.ucode,
                    token: globalVar_1.GlobalVar.token,
                    timestamp: globalVar_1.GlobalVar.timestamp,
                    reqcontent: postDataStr
                });
                postOptions.path = addproductPricePath;
                // 再次调用平台的接口推送数据，并返回结果
                let optionDataAgain = await HttpRequestHelper_1.HttpRequest_POST(postOptions, requestDataAgain);
                let postResultAgain = JSON.parse(String(optionDataAgain));
                if (postResultAgain.flag != 0) {
                    result = true;
                    console.log('cobazaarPush convertSuDa Success: { Id: ' + keyVal + ',Type:' + stateName + ',Datetime:' + date_fns_1.format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message:' + optionDataAgain + '}');
                }
                else {
                    result = false;
                    throw 'cobazaarPush convertSuDa Fail:{ Code:' + postResultAgain.Code + ',queue_in:' + keyVal + ',Type:' + stateName + ',Datetime:' + date_fns_1.format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message:' + optionDataAgain + '}';
                }
            }
            else {
                result = true;
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
        console.log(String(optionData));
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
async function GetProductType(typeId, brandName, packnr, quantity, unit) {
    let result = { ProductType: "", QualityGrade: "", 容量: "", 容量单位: "" };
    //let packageUnit = await ConvertPackage(pachage);
    let capacity = packnr * quantity;
    switch (typeId) {
        case 1:
            result.ProductType = '化学试剂';
            if (brandName == "AccuStandard" || brandName == "Dr. Ehrenstorfer") {
                result.QualityGrade = 'JZ';
            }
            else {
                result.QualityGrade = 'EP';
            }
            result.容量 = capacity;
            result.容量单位 = unit;
            break;
        case 2:
            result.ProductType = '生物试剂';
            result.容量 = capacity;
            result.容量单位 = unit;
            result.QualityGrade = 'BR';
            break;
        case 3:
            result.ProductType = '耗材';
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
            result = 7;
        }
        else if (brandName == 'TCI') {
            result = 4;
        }
        else if (brandName == 'Alfa') {
            result = 7;
        }
        else if (brandName == 'Alfa Aesar') {
            result = 7;
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
// 获取产品图片
function GetImg(brandName) {
    let result = '';
    switch (brandName) {
        case 'J&K':
            result = 'https://www.jkchemical.com/static/casmart/JNK.png';
            break;
        case 'Amethyst':
            result = 'https://www.jkchemical.com/static/casmart/Amethyst.png';
            break;
        case 'Acros':
            result = 'https://www.jkchemical.com/static/casmart/Acros.png';
            break;
        case 'TCI':
            result = 'https://www.jkchemical.com/static/casmart/TCI.png';
            break;
        case 'SERVA':
            result = 'https://www.jkchemical.com/static/casmart/Serva.jpg';
            break;
        case 'Serva':
            result = 'https://www.jkchemical.com/static/casmart/Serva.jpg';
            break;
        case 'Fluorochem':
            result = 'https://www.jkchemical.com/static/casmart/Fluorochem.jpg';
            break;
        case 'AccuStandard':
            result = 'https://www.jkchemical.com/static/casmart/Accustandard.png';
            break;
        case 'Strem':
            result = 'https://www.jkchemical.com/static/casmart/Strem.png';
            break;
        case 'TRC':
            result = 'https://www.jkchemical.com/static/casmart/TRC.jpg';
            break;
        case 'Apollo':
            result = 'https://www.jkchemical.com/static/casmart/Apollo.jpg';
            break;
        case 'Cambridge Isotope Laboratories（CIL）':
            result = 'https://www.jkchemical.com/static/casmart/CIL.png';
            break;
        case 'Polymer Source':
            result = 'https://www.jkchemical.com/static/casmart/Polymersource.png';
            break;
        case 'Matrix':
            result = 'https://www.jkchemical.com/static/casmart/Matrix.png';
            break;
        case 'Rieke Metals':
            result = 'https://www.jkchemical.com/static/casmart/RiekeMetals.jpg';
            break;
        case 'Frontier':
            result = 'https://www.jkchemical.com/static/casmart/Frontier.png';
            break;
        case 'Wilmad':
            result = 'https://www.jkchemical.com/static/casmart/Wilmad.jpg';
            break;
        case '1-Material':
            result = 'https://www.jkchemical.com/static/casmart/1-Material.png';
            break;
        case 'Alfa':
            result = 'https://www.jkchemical.com/static/casmart/ALFA.jpg';
            break;
        case 'Alfa Aesar':
            result = 'https://www.jkchemical.com/static/casmart/ALFA.jpg';
            break;
        case 'Accela':
            result = 'https://www.jkchemical.com/static/casmart/accela.jpg';
            break;
        case 'J&K-Abel':
            result = 'https://www.jkchemical.com/static/casmart/JNKAbel.jpg';
            break;
        case 'J&K Scientific':
            result = 'https://www.jkchemical.com/static/casmart/JNKScientific_200416.png';
            break;
        case 'Echelon':
            result = 'https://www.jkchemical.com/static/casmart/Echelon1.jpg';
            break;
        default:
            result = 'https://www.jkchemical.com/image/map-jk.gif';
            break;
    }
    return result;
}
// 获取库存范围数据
function GetStockamount(brandName, amount) {
    let result = 0;
    if (brandName == 'Acros') {
        result = 99;
    }
    else if (brandName == 'TCI') {
        result = 99;
    }
    else if (brandName == 'Alfa') {
        result = 99;
    }
    else if (brandName == 'Alfa Aesar') {
        result = 99;
    }
    else {
        if (amount > 0 && amount < 11) {
            result = 10;
        }
        else if (amount > 10 && amount < 21) {
            result = 20;
        }
        else if (amount > 20 && amount < 31) {
            result = 30;
        }
        else if (amount > 30 && amount < 40) {
            result = 40;
        }
        else if (amount > 40 && amount < 51) {
            result = 50;
        }
        else if (amount > 50 && amount < 61) {
            result = 60;
        }
        else if (amount > 60 && amount < 100) {
            result = 99;
        }
        else if (amount > 99) {
            result = 100;
        }
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
async function GetDeleteFormat(brandName, originalId, packageSize) {
    return [{
            '品牌': GetBrandName(brandName),
            '货号': originalId,
            '包装规格': packageSize
        }];
}
async function ConvertPackage(packages) {
    try {
        let radiox = 1;
        let radioy;
        let unit;
        //判断是否包含汉字
        var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
        if (reg.test(packages)) {
            return { 容量: "", 容量单位: "" };
        }
        // 判断识别套包装的情况
        let count = packages.indexOf('x');
        if (count > 0) {
            let packageArray = packages.split('x');
            radiox = Number(packageArray[0]);
            let packageSizeSplt = packageArray[1];
            if (packageSizeSplt == '') {
                radioy = await matching_1.matching(packages, 'number');
                unit = await matching_1.matching(packages, 'letter');
            }
            else {
                radioy = await matching_1.matching(packageSizeSplt, 'number');
                unit = await matching_1.matching(packageSizeSplt, 'letter');
            }
        }
        else {
            radioy = await matching_1.matching(packages, 'number');
            unit = await matching_1.matching(packages, 'letter');
        }
        return { 容量: radiox * radioy, 容量单位: unit };
    }
    catch (error) {
        throw error;
    }
}
/**
 * AccuStandard 产品全部加标样二字 之后反馈加过了 是有的产品需要加混标 所以没有用
 * @param ChineseName
 * @param brandName
 * @returns
 */
async function EditChineseName(ChineseName, brandName) {
    let index = ChineseName.indexOf("标样");
    if (brandName == "AccuStandard" && index > 0)
        return ChineseName + " | 标样";
    else
        return ChineseName;
}
function getBrandDiscount(brandName) {
    let result;
    switch (brandName) {
        case 'J&K':
            result = 0.78;
            break;
        case 'Amethyst':
            result = 0.78;
            break;
        case 'Acros':
            result = 0.9;
            break;
        case 'TCI':
            result = 0.8;
            break;
        case 'Fluorochem':
            result = 0.85;
            break;
        case 'Strem':
            result = 0.85;
            break;
        case 'TRC':
            result = 0.85;
            break;
        case 'Apollo':
            result = 0.85;
            break;
        case 'Polymer Source':
            result = 0.85;
            break;
        case 'Matrix':
            result = 0.85;
            break;
        case 'Rieke Metals':
            result = 0.9;
            break;
        case 'Frontier':
            result = 0.85;
            break;
        case 'Wilmad':
            result = 0.8;
            break;
        case '1-Material':
            result = 0.75;
            break;
        case 'Alfa':
            result = 0.8;
            break;
        case 'Alfa Aesar':
            result = 0.8;
            break;
        case 'Accela':
            result = 0.9;
            break;
        case 'Echelon':
            result = 0.9;
            break;
        default:
            result = 1;
            break;
    }
    return result;
}
// 获取新增或者修改格式数据
async function GetAddOrEditFormat(brandName, originalId, packageSize, chineseName, englishName, catalogPrice, CAS, deliveryCycle, purity, MDL, jkid, typeId, stock, packnr, quantity, unit) {
    let ProductType = await GetProductType(typeId, brandName, packnr, quantity, unit);
    return [{
            '品牌': GetBrandName(brandName),
            '货号': originalId,
            '包装规格': packageSize,
            '产品分类': ProductType.ProductType,
            '中文名称': chineseName,
            '英文名称': englishName,
            '主图': GetImg(brandName),
            '目录价(RMB)': catalogPrice,
            'CAS': CAS,
            '质量等级': ProductType.QualityGrade,
            '包装单位': '瓶',
            '交货期': GetFutureDelivery(stock, brandName, deliveryCycle),
            '纯度': purity,
            '保存条件': '',
            '运输条件': '',
            '中文别名': '',
            '英文别名': '',
            '关键词': '',
            '其他描述': '',
            'MDL': MDL.replace(' ', '').replace(' ', ''),
            '链接地址': GetDetaUrl(jkid),
            '库存': GetStockamount(brandName, stock),
            '容量': ProductType.容量,
            '容量单位': ProductType.容量单位
        }];
}
// 获取促销产品格式数据
async function GetCuXiaoFormat(brandName, originalId, packageSize, chineseName, englishName, catalogPrice, activeDiscount, CAS, deliveryCycle, purity, MDL, jkid, typeId, stock, pEndTime, packnr, quantity, unit) {
    let salePrice = lodash_1.round(catalogPrice * (1 - activeDiscount));
    let ProductType = await GetProductType(typeId, brandName, packnr, quantity, unit);
    return [{
            '品牌': GetBrandName(brandName),
            '货号': originalId,
            '包装规格': packageSize,
            '产品分类': ProductType.ProductType,
            '售价': salePrice,
            '特惠结束时间': pEndTime,
            '平台编号': '全部',
            '中文名称': chineseName,
            '英文名称': englishName,
            '主图': GetImg(brandName),
            '目录价(RMB)': catalogPrice,
            'CAS': CAS,
            '质量等级': ProductType.QualityGrade,
            '包装单位': '瓶',
            '交货期': GetFutureDelivery(stock, brandName, deliveryCycle),
            '纯度': purity,
            '保存条件': '',
            '运输条件': '',
            '中文别名': '',
            '英文别名': '',
            '关键词': '',
            '其他描述': '',
            'MDL': MDL.replace(' ', '').replace(' ', ''),
            '链接地址': GetDetaUrl(jkid),
            '库存': GetStockamount(brandName, stock),
            '容量': ProductType.容量,
            '容量单位': ProductType.容量单位
        }];
}
// 苏州大学为什么要特殊判断处理？ 是因为舒经理反馈苏大危险品需要加收10元，平台给出方案是按照促销产品的形式来处理，危险品单独设置价格;
async function GetWeiXianFormatForSuDa(brandName, originalId, packageSize, chineseName, englishName, catalogPrice, CAS, deliveryCycle, purity, MDL, jkid, typeId, stock, packnr, quantity, unit) {
    let discount = getBrandDiscount(brandName);
    let salePrice = lodash_1.round((catalogPrice * discount) + 10);
    let ProductType = await GetProductType(typeId, brandName, packnr, quantity, unit);
    return [{
            '品牌': GetBrandName(brandName),
            '货号': originalId,
            '包装规格': packageSize,
            '产品分类': ProductType.ProductType,
            '售价': salePrice,
            '特惠结束时间': date_fns_1.format(new Date('2021-12-31 23:59:50'), 'yyyy-MM-dd HH:mm:ss'),
            '平台编号': 'suda',
            '中文名称': chineseName,
            '英文名称': englishName,
            '主图': GetImg(brandName),
            '目录价(RMB)': lodash_1.round(catalogPrice),
            'CAS': CAS,
            '质量等级': ProductType.QualityGrade,
            '包装单位': '瓶',
            '交货期': GetFutureDelivery(stock, brandName, deliveryCycle),
            '纯度': purity,
            '保存条件': '',
            '运输条件': '',
            '中文别名': '',
            '英文别名': '',
            '关键词': '',
            '其他描述': '',
            'MDL': MDL.replace(' ', '').replace(' ', ''),
            '链接地址': GetDetaUrl(jkid),
            '库存': GetStockamount(brandName, stock),
            '容量': ProductType.容量,
            '容量单位': ProductType.容量单位
        }];
}
//# sourceMappingURL=cobazaarPullWrite.js.map