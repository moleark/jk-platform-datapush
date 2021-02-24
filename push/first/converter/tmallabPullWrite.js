"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tmallabPullWrite = void 0;
const uq_joint_1 = require("uq-joint");
const date_fns_1 = require("date-fns");
let md5 = require('md5');
const config_1 = __importDefault(require("config"));
const logger_1 = require("../../tools/logger");
const HttpRequestHelper_1 = require("../../tools/HttpRequestHelper");
const globalVar_1 = require("../../tools/globalVar");
// 首科方元接口相关配置
const tmallabApiSetting = config_1.default.get("tmallabApi");
// 获取产品类型
function GetProductType(templateTypeId) {
    let result = '';
    if (templateTypeId == '1') {
        result = '化学试剂';
    }
    else if (templateTypeId == '2') {
        result = '生物试剂';
    }
    else if (templateTypeId == '3') {
        result = '实验耗材';
    }
    return result;
}
// 获取产品单位
function GetProductUnit(templateTypeId, Packnr, Unit) {
    let result = '';
    if (templateTypeId == '1' || templateTypeId == '2') {
        result = Packnr + '瓶';
    }
    else if (templateTypeId == '3') {
        if (Unit == 'APPLS' || Unit == 'MG' || Unit == 'ΜL') {
            result = Packnr + 'PAK';
        }
        else {
            result = Packnr + Unit;
        }
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
// 获取货期
function GetDelivetime(brandName, Storage, deliveryCycle) {
    let result = '期货';
    if (Storage > 0) {
        result = '现货(交货期1-3天)';
    }
    else {
        if (brandName == 'Acros') {
            result = '2-5个工作日';
        }
        else if (brandName == 'TCI') {
            result = '2-5个工作日';
        }
        else if (brandName == 'Alfa') {
            result = '2-5个工作日';
        }
        else if (brandName == 'Alfa Aesar') {
            result = '2-5个工作日';
        }
        else {
            result = deliveryCycle;
        }
    }
    return result;
}
// 获取品牌
function GetBrand(brandName) {
    let result = '';
    if (brandName == 'Frontier') {
        result = 'Frontier Scientific';
    }
    else if (brandName == 'Dr. Ehrenstorfer') {
        result = 'DR.E';
    }
    else if (brandName == 'Alfa') {
        result = 'ALFA';
    }
    else if (brandName == 'Alfa Aesar') {
        result = 'ALFA';
    }
    else if (brandName == 'ChromaDex') {
        result = 'Chromadex';
    }
    else if (brandName == 'SERVA') {
        result = 'Serva';
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
/*
// 获取促销产品推送数据格式
function GetPromotionFormat(vipCode, brand, itemNum, packingSpecification, salePrice, startTime, endTime, appSecurity): any {

    let PromotionInfo = {
        vipCode: vipCode,
        brand: GetBrand(brand),
        itemNum: itemNum,
        packingSpecification: packingSpecification,
        price: Math.round(salePrice),
        startTime: format(startTime - 8 * 3600 * 1000, 'yyyy-MM-dd HH:mm:SS'),
        endTime: format(endTime - 8 * 3600 * 1000, 'yyyy-MM-dd HH:mm:SS'),
        appSecurity: appSecurity,
        platform: '',
        version: '1.3'
    }
    return PromotionInfo;
}*/
// 获取新增或者修改推送数据格式
function GetAddOrEditFormat(itemNum, brand, packingSpecification, casFormat, catalogPrice, descriptionC, description, descriptionST, purity, storage, jkid, templateTypeId, mdlNumber, packnr, unit, delivetime, salePrice, startTime, endTime) {
    let productInfo = {
        品牌: GetBrand(brand),
        货号: itemNum,
        包装规格: packingSpecification,
        销售单位: GetProductUnit(templateTypeId, packnr, unit),
        英文名称: GetFarmetName(description),
        中文名称: GetFarmetName(descriptionC),
        目录价str: catalogPrice,
        纯度: purity,
        库存: GetStockamount(brand, storage),
        交货期: GetDelivetime(brand, storage, delivetime),
        储存温度: descriptionST,
        来源: "",
        运输条件: "",
        CAS: casFormat,
        MDL: mdlNumber,
        最小包装: "",
        最小包装数量: "",
        产品链接: GetDetaUrl(jkid),
        图片链接: GetImg(brand),
        促销平台: "",
        促销开始日期: date_fns_1.format(startTime - 8 * 3600 * 1000, 'yyyy-MM-dd HH:mm:SS'),
        促销截止日期: date_fns_1.format(endTime - 8 * 3600 * 1000, 'yyyy-MM-dd HH:mm:SS'),
        促销价: Math.round(salePrice)
    };
    return productInfo;
}
function GetFarmetName(str) {
    let result = '';
    if (str != null) {
        //去除空格、反斜杠、括号、+- &
        result = str.replace(/[/]/g, '').replace(/[#]/g, '').replace(/[ ]/g, '');
        if (result.length > 100) {
            result = result.substring(0, 99);
        }
    }
    return result;
}
// 推送
async function tmallabPullWrite(joint, uqIn, data) {
    let { key, mapper, uq: uqFullName, entity: tuid } = uqIn;
    if (key === undefined)
        throw 'key is not defined';
    if (uqFullName === undefined)
        throw 'tuid ' + tuid + ' not defined';
    let keyVal = data[key];
    //let mapToUq = new MapToUq(this);
    let mapToUq = new uq_joint_1.MapUserToUq(joint);
    let body = await mapToUq.map(data, mapper);
    let version = '1.3';
    try {
        let result = false;
        let { vipCode, appSecurity, hostname, pushProductPath, deleteOneProductPath, updatePromotionInfoPath } = tmallabApiSetting;
        let { itemNum, brand, packingSpecification, casFormat, catalogPrice, descriptionC, description, descriptionST, purity, storage, jkid, templateTypeId, isDelete, stateName, packageId, mdlNumber, packnr, unit, activeDiscount, salePrice, delivetime, pStartTime, pEndTime } = body;
        let timestamp = date_fns_1.format(Date.now(), 'yyyy-MM-dd HH:mm:ss');
        let postDataStr = {};
        let options = {
            hostname: hostname,
            path: '',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            }
        };
        // 产品下架的情况，删除接口是单个删除。
        if (isDelete == 1) {
            let deleteData = {
                vipCode: vipCode,
                platform: '',
                brand: GetBrand(brand),
                itemNum: itemNum,
                packingSpecification: packingSpecification,
                appSecurity: appSecurity,
                version: version
            };
            postDataStr = JSON.stringify(deleteData);
            options.path = deleteOneProductPath;
            // 调用平台的接口推送数据，并返回结果
            let optionData = await HttpRequestHelper_1.HttpRequest_POST(options, postDataStr);
            // console.log(optionData);
            let postResult = JSON.parse(String(optionData));
            // 判断推送结果
            if (postResult.flag != 0) {
                result = true;
                console.log('TmallabPush Success: { PackageId: ' + packageId + ',Type:' + stateName + ',Datetime:' + date_fns_1.format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message:' + optionData + '}');
            }
            else {
                result = false;
                throw 'TmallabPush Fail:{ Code:' + postResult.Code + ',queue_in:' + keyVal + ',Type:' + stateName + ',Datetime:' + date_fns_1.format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message:' + optionData + '}';
            }
        }
        /*
        // 市场活动产品，需要调用平台市场活动接口。但是调用市场活动接口前提得保证数据添加到对方平台上，所以在此市场活动单个产品先调用推送接口后 再调用市场活动接口。
        else if (isDelete == 0 && activeDiscount != '' && activeDiscount != null) {

            let product = GetAddOrEditFormat(itemNum, brand, packingSpecification, casFormat, catalogPrice, descriptionC, description, descriptionST, purity, storage, jkid,
                templateTypeId, mdlNumber, packnr, unit, delivetime);

            let addData = {
                product: [product],
                productType: GetProductType(templateTypeId),
                vipCode: vipCode,
                platform: '',
                appSecurity: appSecurity,
                version: version
            }
            postDataStr = JSON.stringify(addData);
            options.path = pushProductPath;

            // 调用平台的接口推送数据，并返回结果;
            let optionData = await HttpRequest_POST(options, postDataStr);
            let postResult = JSON.parse(String(optionData));

            // 判断推送结果
            if (postResult.flag != 0) {

                console.log('TmallabPush Success: { PackageId: ' + packageId + ',Type:' + stateName + ',Datetime:' + format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message:' + optionData + '}');
                let promotionData = await GetPromotionFormat(vipCode, brand, itemNum, packingSpecification, salePrice, pStartTime, pEndTime, appSecurity);
                postDataStr = JSON.stringify(promotionData);
                options.path = updatePromotionInfoPath;

                // 再次调用平台的接口推送数据，并返回结果
                let optionDataAgain = await HttpRequest_POST(options, postDataStr);
                // console.log(optionDataAgain);
                let postResultAgain = JSON.parse(String(optionDataAgain));

                if (postResultAgain.flag != 0) {
                    result = true;
                    console.log('TmallabPush Success: { PackageId: ' + packageId + ',Type:' + stateName + ',Datetime:' + format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message:' + optionDataAgain + '}');
                } else {
                    result = false;
                    throw 'TmallabPush Fail:{ Code:' + postResultAgain.Code + ',queue_in:' + keyVal + ',Type:' + stateName + ',Datetime:' + format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message:' + optionData + '}';
                }
            } else if (String(postResult.data).includes("此处禁止上传管控品")) {

                result = true;
                console.log('TmallabPush Fail:{ Code:' + postResult.Code + ',queue_in:' + keyVal + ',Type:' + stateName + ',Datetime:' + format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message:' + optionData + '}');
            } else {
                result = false;
                throw 'TmallabPush Fail:{ Code:' + postResult.Code + ',queue_in:' + keyVal + ',Type:' + stateName + ',Datetime:' + format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message:' + optionData + '}';
            }
        }
        */
        // 产品 “新增”或者“修改”的情况。需要批量推送。先判断单个数据对应的处理情况，存储到数组中（等存储够一定量的数据批量推送）。
        else if (isDelete == 0) {
            if (templateTypeId == 1) {
                globalVar_1.GlobalVar.addOrEditList_chem.push(body);
                console.log('chem count: ' + globalVar_1.GlobalVar.addOrEditList_chem.length);
            }
            else if (templateTypeId == 2) {
                globalVar_1.GlobalVar.addOrEditList_bio.push(body);
                console.log('bio count: ' + globalVar_1.GlobalVar.addOrEditList_bio.length);
            }
            else if (templateTypeId == 3) {
                globalVar_1.GlobalVar.addOrEditList_cl.push(body);
                console.log('cl count: ' + globalVar_1.GlobalVar.addOrEditList_cl.length);
            }
        }
        // 化学试剂 推送，满足100 条数据推送一次；
        if (globalVar_1.GlobalVar.addOrEditList_chem.length > 99) {
            console.log(date_fns_1.format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ' 化学试剂数量: 100 ，准备推送... 生物试剂数量: ' + globalVar_1.GlobalVar.addOrEditList_bio.length + ', 仪器耗材数量: ' + globalVar_1.GlobalVar.addOrEditList_cl.length);
            let productList_addOrEdit = [];
            for (let i = globalVar_1.GlobalVar.addOrEditList_chem.length - 1; i >= 0; i--) {
                let { itemNum: iItemNum, brand: iBrand, packingSpecification: iPackingSpecification, casFormat: iCasFormat, catalogPrice: iCatalogPrice, descriptionC: iDescriptionC, description: iDescription, descriptionST: iDescriptionST, purity: iPurity, storage: iStorage, jkid: iJkid, templateTypeId: iTemplateTypeId, mdlNumber: iMdlNumber, packnr: iPacknr, unit: iUnit, delivetime: iDelivetime, salePrice: iSalePrice, pStartTime: iPStartTime, pEndTime: iPEndTime } = globalVar_1.GlobalVar.addOrEditList_chem[i];
                let AddOrEditFormat = GetAddOrEditFormat(iItemNum, iBrand, iPackingSpecification, iCasFormat, iCatalogPrice, iDescriptionC, iDescription, iDescriptionST, iPurity, iStorage, iJkid, iTemplateTypeId, iMdlNumber, iPacknr, iUnit, iDelivetime, iSalePrice, iPStartTime, iPEndTime);
                productList_addOrEdit.push(AddOrEditFormat);
                globalVar_1.GlobalVar.addOrEditList_chem = globalVar_1.GlobalVar.addOrEditList_chem.filter(a => a !== globalVar_1.GlobalVar.addOrEditList_chem[i]);
                // console.log(DataList.addOrEditList_chem.length);
            }
            let addData = {
                product: productList_addOrEdit,
                productType: GetProductType('1'),
                vipCode: vipCode,
                platform: '',
                appSecurity: appSecurity,
                version: version
            };
            postDataStr = JSON.stringify(addData);
            options.path = pushProductPath;
            // 调用平台的接口推送数据，并返回结果
            let optionData = await HttpRequestHelper_1.HttpRequest_POST(options, postDataStr);
            let postResult = JSON.parse(String(optionData));
            // 判断推送结果
            if (postResult.flag != 0) {
                result = true;
                console.log('TmallabPush Success: { Type:' + GetProductType('1') + ',Datetime:' + date_fns_1.format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message:' + optionData + '}');
            }
            else {
                result = false;
                throw 'TmallabPush Fail{ Code:' + postResult.Code + ', queue_in:' + keyVal + ',Type:' + GetProductType('1') + ',Datetime:' + date_fns_1.format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message:' + optionData + '}';
            }
        }
        // 生物试剂 推送，满足 10 条数据推送一次；
        if (globalVar_1.GlobalVar.addOrEditList_bio.length > 9) {
            console.log(date_fns_1.format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ' 生物试剂数量: 10 ，准备推送... , 仪器耗材数量: ' + globalVar_1.GlobalVar.addOrEditList_cl.length + ', 化学试剂数量: ' + globalVar_1.GlobalVar.addOrEditList_chem.length);
            let productList_addOrEdit = [];
            for (let i = globalVar_1.GlobalVar.addOrEditList_bio.length - 1; i >= 0; i--) {
                let { itemNum: iItemNum, brand: iBrand, packingSpecification: iPackingSpecification, casFormat: iCasFormat, catalogPrice: iCatalogPrice, descriptionC: iDescriptionC, description: iDescription, descriptionST: iDescriptionST, purity: iPurity, storage: iStorage, jkid: iJkid, templateTypeId: iTemplateTypeId, mdlNumber: iMdlNumber, packnr: iPacknr, unit: iUnit, delivetime: iDelivetime, salePrice: iSalePrice, pStartTime: iPStartTime, pEndTime: iPEndTime } = globalVar_1.GlobalVar.addOrEditList_bio[i];
                let AddOrEditFormat = GetAddOrEditFormat(iItemNum, iBrand, iPackingSpecification, iCasFormat, iCatalogPrice, iDescriptionC, iDescription, iDescriptionST, iPurity, iStorage, iJkid, iTemplateTypeId, iMdlNumber, iPacknr, iUnit, iDelivetime, iSalePrice, iPStartTime, iPEndTime);
                productList_addOrEdit.push(AddOrEditFormat);
                globalVar_1.GlobalVar.addOrEditList_bio = globalVar_1.GlobalVar.addOrEditList_bio.filter(a => a !== globalVar_1.GlobalVar.addOrEditList_bio[i]);
                // console.log(DataList.addOrEditList_bio.length);
            }
            let addData = {
                product: productList_addOrEdit,
                productType: GetProductType('2'),
                vipCode: vipCode,
                platform: '',
                appSecurity: appSecurity,
                version: version
            };
            postDataStr = JSON.stringify(addData);
            options.path = pushProductPath;
            // 调用平台的接口推送数据，并返回结果
            let optionData = await HttpRequestHelper_1.HttpRequest_POST(options, postDataStr);
            let postResult = JSON.parse(String(optionData));
            // 判断推送结果
            if (postResult.flag != 0) {
                result = true;
                console.log('TmallabPush Success: { Type:' + GetProductType('1') + ',Datetime:' + date_fns_1.format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message:' + optionData + '}');
            }
            else {
                result = false;
                throw 'TmallabPush Fail:{ Code:' + postResult.Code + ', queue_in:' + keyVal + ',Type:' + GetProductType('1') + ',Datetime:' + date_fns_1.format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message:' + optionData + '}';
            }
        }
        // 仪器耗材 推送，满足 10 条数据推送一次；
        if (globalVar_1.GlobalVar.addOrEditList_cl.length > 9) {
            console.log(date_fns_1.format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ' 仪器耗材数量: 10 ，准备推送... , 化学试剂数量: ' + globalVar_1.GlobalVar.addOrEditList_chem.length + ', 生物试剂数量: ' + globalVar_1.GlobalVar.addOrEditList_bio.length);
            let productList_addOrEdit = [];
            for (let i = globalVar_1.GlobalVar.addOrEditList_cl.length - 1; i >= 0; i--) {
                let { itemNum: iItemNum, brand: iBrand, packingSpecification: iPackingSpecification, casFormat: iCasFormat, catalogPrice: iCatalogPrice, descriptionC: iDescriptionC, description: iDescription, descriptionST: iDescriptionST, purity: iPurity, storage: iStorage, jkid: iJkid, templateTypeId: iTemplateTypeId, mdlNumber: iMdlNumber, packnr: iPacknr, unit: iUnit, delivetime: iDelivetime, salePrice: iSalePrice, pStartTime: iPStartTime, pEndTime: iPEndTime } = globalVar_1.GlobalVar.addOrEditList_cl[i];
                let AddOrEditFormat = GetAddOrEditFormat(iItemNum, iBrand, iPackingSpecification, iCasFormat, iCatalogPrice, iDescriptionC, iDescription, iDescriptionST, iPurity, iStorage, iJkid, iTemplateTypeId, iMdlNumber, iPacknr, iUnit, iDelivetime, iSalePrice, iPStartTime, iPEndTime);
                productList_addOrEdit.push(AddOrEditFormat);
                globalVar_1.GlobalVar.addOrEditList_cl = globalVar_1.GlobalVar.addOrEditList_cl.filter(a => a !== globalVar_1.GlobalVar.addOrEditList_cl[i]);
                // console.log(DataList.addOrEditList_cl.length);
            }
            let addData = {
                product: productList_addOrEdit,
                productType: GetProductType('3'),
                vipCode: vipCode,
                platform: '',
                appSecurity: appSecurity,
                version: version
            };
            postDataStr = JSON.stringify(addData);
            options.path = pushProductPath;
            // 调用平台的接口推送数据，并返回结果
            let optionData = await HttpRequestHelper_1.HttpRequest_POST(options, postDataStr);
            let postResult = JSON.parse(String(optionData));
            // 判断推送结果
            if (postResult.flag != 0) {
                result = true;
                console.log('TmallabPush Success: { Type:' + GetProductType('1') + ',Datetime:' + date_fns_1.format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message:' + optionData + '}');
            }
            else {
                result = false;
                throw 'TmallabPush Fail:{ Code:' + postResult.Code + ', queue_in:' + keyVal + ',Type:' + GetProductType('1') + ',Datetime:' + date_fns_1.format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message:' + optionData + '}';
            }
        }
        return result;
    }
    catch (error) {
        logger_1.logger.error(error);
        throw error;
    }
}
exports.tmallabPullWrite = tmallabPullWrite;
//# sourceMappingURL=tmallabPullWrite.js.map