"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
let md5 = require('md5');
const config_1 = __importDefault(require("config"));
const logger_1 = require("../../tools/logger");
const util_1 = require("util");
//快去采接口相关配置
const kuaiQuCaiApiSetting = config_1.default.get("kuaiQuCaiApi");
//获取化学品名称
function GetChemName(description, descriptionC) {
    let result = '';
    if (util_1.isNullOrUndefined(descriptionC) || descriptionC === '') {
        result = description;
    }
    else {
        result = descriptionC;
    }
    return result;
}
//获取货期
function GetDeliveTime(deliveryTime) {
    let result = '';
    if (Number(deliveryTime) <= 15) {
        result = deliveryTime;
    }
    else if (Number(deliveryTime) <= 21) {
        result = '21';
    }
    else if (Number(deliveryTime) <= 31) {
        result = '31';
    }
    else {
        result = '32';
    }
    return result;
}
//获取货期类型：0 现货, 1 期货(5个品牌是代理国产商品), 2 期货(代理进口商品);
function GetDeliveType(storage, brandName) {
    let result = 1;
    if (storage > 0) {
        result = 1;
    }
    else {
        switch (brandName) {
            case "J&K":
                result = 2;
                break;
            case "Amethyst":
                result = 2;
                break;
            case "J&K-Abel":
                result = 2;
                break;
            case "J&K Scientific":
                result = 2;
                break;
            case "Accela":
                result = 2;
                break;
            default:
                result = 3;
                break;
        }
    }
    return result;
}
//获取厂商商品描述
function GetSpecMark(packnr, packageSize, unit) {
    let result = "";
    if (Number(packnr) > 1) {
        result = packnr + "*" + packageSize + "unit" + " 套包装;";
    }
    else {
        result = "";
    }
    return result;
}
//获取仪器耗材产品图片
function GetImg(brandName) {
    //let result = ['https://www.baidu.com/img/bd_logo1.png'];
    let result = [];
    /*if (brandName == "J&K Scentice") {
        result = ['1.img', '2.img'];
    }*/
    return result;
}
//获取规格单位
function GetSpec(unit) {
    let result = "";
    if (unit == "EA") {
        result = 'EA';
    }
    else if (unit == "台") {
        result = '台';
    }
    else if (unit == "支") {
        result = '支';
    }
    else if (unit == "PAK") {
        result = '包';
    }
    else if (unit == "PCS") {
        result = '个';
    }
    else if (unit == "PACK") {
        result = '包';
    }
    else if (unit == "个") {
        result = '个';
    }
    else if (unit == "盒") {
        result = '盒';
    }
    else if (unit == "套") {
        result = '套';
    }
    else if (unit == "箱") {
        result = '箱';
    }
    else if (unit == "对") {
        result = '对';
    }
    else {
        result = 'none';
    }
    return result;
}
//获取生物试剂的chemid
function GetChemId(categoryId) {
    return 'SWSJ-002'; //没有其他部门同事进行帮忙分类，咱取其中一条
}
//获取耗材产品到货时间
function GetCLDeliveryTime(storage) {
    let result = "";
    if (Number(storage) > 1) {
        result = "03";
    }
    else {
        result = "15";
    }
    return result;
}
// 
async function KuaiQuCaiPullWrite(joint, data) {
    try {
        //定义变量
        console.log(data);
        //console.log('快去采平台处理');
        let result = false;
        let { companyId, key, host, chemAddPath, chemUpdatePath, bioAddPath, bioUpdatePath, clAddPath, clUpdatePath, deletePath } = kuaiQuCaiApiSetting;
        let DateTime = Date.now();
        let timestamp = parseFloat((DateTime / 1000).toFixed());
        let token = md5(timestamp + companyId + key);
        let postData = {};
        let options = {
            host: host,
            path: '',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'TIMESTAMP': timestamp,
                'COMPANY': companyId,
                'TOKEN': token
            }
        };
        //产品下架的情况
        if (data["IsDelete"] == '1') {
            let deleteData = data["PackageId"];
            postData = JSON.stringify({ COMPANY_SALE_NOS: deleteData });
            options.path = deletePath;
        }
        else {
            let chemName = GetChemName(data["Description"], data["DescriptionC"]); //获取化学品名称 
            let deliveTime = GetDeliveTime(data["Delivetime"]);
            let deliveType = GetDeliveType(data["Storage"], data["BrandName"]);
            let specMark = GetSpecMark(data["Packnr"], data["Quantity"], data["Unit"]);
            let supllyCompanyId = '162';
            let supllyCompany = '百灵威';
            let saleCompanyName = '北京百灵威科技有限公司';
            let saleCompanyPhone = '010-59309000';
            let spec = GetSpec(data["Unit"]);
            let clDeliveryTime = GetCLDeliveryTime(data["Storage"]);
            if (data["StateName"] == 'add') {
                switch (data["Templatetypeid"]) {
                    case 1:
                        let addDataChem = {
                            COMPANY_SALE_NO: data["PackageId"],
                            CHEM_ID: data["CasFormat"],
                            COMPANY_CHEM_NAME: chemName,
                            COMPANY_BIO_NAME: '',
                            COMPANY_CL_NAME: '',
                            PRICE: data["CatalogPrice"],
                            VALUMEUNIT_ID: data["Unit"],
                            VALUME: data["Quantity"],
                            SPEC_ID: '瓶',
                            SPEC_MARK: specMark,
                            SALE_MARK: 1,
                            PURITY: data["Purity"],
                            STOCK: data["Storage"],
                            SRC_COMPANY: data["BrandName"],
                            ARTICLE_NO: data["OriginalId"],
                            DISCOUNT_RATE: data["Discount"],
                            DELIVERYTIME_ID: deliveTime,
                            DELIVERY_TYPE_ID: deliveType,
                            COMPANY_DESC: specMark,
                            SUPPLY_COMPANY_ID: supllyCompanyId,
                            SUPPLY_COMPANY: supllyCompany,
                            SALE_COMPANY_NAME: saleCompanyName,
                            SALE_COMPANY_PHONE: saleCompanyPhone,
                            BRAND_NAME: data["BrandName"],
                            POSTAGE: 12,
                            NO_POSTAGE_NUM: 0,
                            BIO_TYPE_ID: '',
                            CL_TYPE_ID: '',
                            PACKAGE_TYPE: '',
                            IMG: []
                        };
                        postData = JSON.stringify({ "DATA": [addDataChem] });
                        options.path = chemAddPath;
                        break;
                    case 2:
                        let chemid = GetChemId(data["CategoryId"]);
                        let addDataBio = {
                            COMPANY_SALE_NO: data["PackageId"],
                            CHEM_ID: chemid,
                            COMPANY_CHEM_NAME: '',
                            COMPANY_BIO_NAME: chemName,
                            COMPANY_CL_NAME: '',
                            PRICE: data["CatalogPrice"],
                            VALUMEUNIT_ID: data["Unit"],
                            VALUME: data["Quantity"],
                            SPEC_ID: '瓶',
                            SPEC_MARK: specMark,
                            SALE_MARK: 1,
                            PURITY: data["Purity"],
                            STOCK: data["Storage"],
                            SRC_COMPANY: data["BrandName"],
                            ARTICLE_NO: data["OriginalId"],
                            DISCOUNT_RATE: data["Discount"],
                            DELIVERYTIME_ID: deliveTime,
                            DELIVERY_TYPE_ID: deliveType,
                            COMPANY_DESC: specMark,
                            SUPPLY_COMPANY_ID: supllyCompanyId,
                            SUPPLY_COMPANY: supllyCompany,
                            SALE_COMPANY_NAME: saleCompanyName,
                            SALE_COMPANY_PHONE: saleCompanyPhone,
                            BRAND_NAME: data["BrandName"],
                            POSTAGE: 12,
                            NO_POSTAGE_NUM: 0,
                            BIO_TYPE_ID: '044',
                            CL_TYPE_ID: '',
                            PACKAGE_TYPE: '',
                            IMG: []
                        };
                        postData = JSON.stringify({ "DATA": [addDataBio] });
                        options.path = bioAddPath;
                        break;
                    case 3:
                        let img = GetImg(data["BrandName"]);
                        let addDataCl = {
                            COMPANY_SALE_NO: data["PackageId"],
                            COMPANY_CHEM_NAME: '',
                            COMPANY_BIO_NAME: '',
                            COMPANY_CL_NAME: chemName,
                            PRICE: data["CatalogPrice"],
                            VALUMEUNIT_ID: 'EA',
                            VALUME: '',
                            SPEC_ID: spec,
                            SPEC_MARK: specMark,
                            SALE_MARK: 1,
                            PURITY: data["Purity"],
                            STOCK: data["Storage"],
                            SRC_COMPANY: data["BrandName"],
                            ARTICLE_NO: data["OriginalId"],
                            DISCOUNT_RATE: data["Discount"],
                            DELIVERYTIME_ID: clDeliveryTime,
                            DELIVERY_TYPE_ID: deliveType,
                            COMPANY_DESC: specMark,
                            SUPPLY_COMPANY_ID: supllyCompanyId,
                            SUPPLY_COMPANY: supllyCompany,
                            SALE_COMPANY_NAME: saleCompanyName,
                            SALE_COMPANY_PHONE: saleCompanyPhone,
                            BRAND_NAME: data["BrandName"],
                            POSTAGE: 12,
                            NO_POSTAGE_NUM: 0,
                            BIO_TYPE_ID: '',
                            CL_TYPE_ID: '02011',
                            PACKAGE_TYPE: data["Quantity"] + data["Unit"],
                            IMG: img
                        };
                        postData = JSON.stringify({ "DATA": [addDataCl] });
                        options.path = clAddPath;
                        break;
                    default:
                        break;
                }
            }
            else if (data["StateName"] == 'edit') {
                switch (data["Templatetypeid"]) {
                    case 1:
                        let updateDataChem = {
                            COMPANY_SALE_NO: data["PackageId"],
                            CHEM_ID: data["CasFormat"],
                            COMPANY_CHEM_NAME: chemName,
                            COMPANY_BIO_NAME: '',
                            COMPANY_CL_NAME: '',
                            PRICE: data["CatalogPrice"],
                            VALUMEUNIT_ID: data["Unit"],
                            VALUME: data["Quantity"],
                            SPEC_ID: '瓶',
                            SPEC_MARK: specMark,
                            SALE_MARK: 1,
                            PURITY: data["Purity"],
                            STOCK: data["Storage"],
                            SRC_COMPANY: data["BrandName"],
                            ARTICLE_NO: data["OriginalId"],
                            DISCOUNT_RATE: data["Discount"],
                            DELIVERYTIME_ID: deliveTime,
                            DELIVERY_TYPE_ID: deliveType,
                            COMPANY_DESC: specMark,
                            SUPPLY_COMPANY_ID: supllyCompanyId,
                            SUPPLY_COMPANY: supllyCompany,
                            SALE_COMPANY_NAME: saleCompanyName,
                            SALE_COMPANY_PHONE: saleCompanyPhone,
                            BRAND_NAME: data["BrandName"],
                            POSTAGE: 12,
                            NO_POSTAGE_NUM: 0,
                            BIO_TYPE_ID: '',
                            CL_TYPE_ID: '',
                            PACKAGE_TYPE: '',
                            IMG: []
                        };
                        postData = JSON.stringify({ "DATA": [updateDataChem] });
                        options.path = chemUpdatePath;
                        break;
                    case 2:
                        let chemid = GetChemId(data["CategoryId"]);
                        let updateDataBio = {
                            COMPANY_SALE_NO: data["PackageId"],
                            CHEM_ID: chemid,
                            COMPANY_CHEM_NAME: '',
                            COMPANY_BIO_NAME: chemName,
                            COMPANY_CL_NAME: '',
                            PRICE: data["CatalogPrice"],
                            VALUMEUNIT_ID: data["Unit"],
                            VALUME: data["Quantity"],
                            SPEC_ID: '瓶',
                            SPEC_MARK: specMark,
                            SALE_MARK: 1,
                            PURITY: data["Purity"],
                            STOCK: data["Storage"],
                            SRC_COMPANY: data["BrandName"],
                            ARTICLE_NO: data["OriginalId"],
                            DISCOUNT_RATE: data["Discount"],
                            DELIVERYTIME_ID: deliveTime,
                            DELIVERY_TYPE_ID: deliveType,
                            COMPANY_DESC: specMark,
                            SUPPLY_COMPANY_ID: supllyCompanyId,
                            SUPPLY_COMPANY: supllyCompany,
                            SALE_COMPANY_NAME: saleCompanyName,
                            SALE_COMPANY_PHONE: saleCompanyPhone,
                            BRAND_NAME: data["BrandName"],
                            POSTAGE: 12,
                            NO_POSTAGE_NUM: 0,
                            BIO_TYPE_ID: '044',
                            CL_TYPE_ID: '',
                            PACKAGE_TYPE: '',
                            IMG: []
                        };
                        postData = JSON.stringify({ "DATA": [updateDataBio] });
                        options.path = bioUpdatePath;
                        break;
                    case 3:
                        let img = GetImg(data["BrandName"]);
                        let updateDataCl = {
                            COMPANY_SALE_NO: data["PackageId"],
                            CHEM_ID: '',
                            COMPANY_CHEM_NAME: '',
                            COMPANY_BIO_NAME: '',
                            COMPANY_CL_NAME: chemName,
                            PRICE: data["CatalogPrice"],
                            VALUMEUNIT_ID: data["Unit"],
                            VALUME: data["Quantity"],
                            SPEC_ID: spec,
                            SPEC_MARK: specMark,
                            SALE_MARK: 1,
                            PURITY: data["Purity"],
                            STOCK: data["Storage"],
                            SRC_COMPANY: data["BrandName"],
                            ARTICLE_NO: data["OriginalId"],
                            DISCOUNT_RATE: data["Discount"],
                            DELIVERYTIME_ID: clDeliveryTime,
                            DELIVERY_TYPE_ID: deliveType,
                            COMPANY_DESC: specMark,
                            SUPPLY_COMPANY_ID: supllyCompanyId,
                            SUPPLY_COMPANY: supllyCompany,
                            SALE_COMPANY_NAME: saleCompanyName,
                            SALE_COMPANY_PHONE: saleCompanyPhone,
                            BRAND_NAME: data["BrandName"],
                            POSTAGE: 12,
                            NO_POSTAGE_NUM: 0,
                            BIO_TYPE_ID: '',
                            CL_TYPE_ID: '02011',
                            PACKAGE_TYPE: data["Quantity"] + data["Unit"],
                            IMG: img
                        };
                        postData = JSON.stringify({ "DATA": [updateDataCl] });
                        options.path = clUpdatePath;
                        break;
                    default:
                        break;
                }
            }
        }
        //获取准备数据改后  开始推送...
        var req = http_1.default.request(options, function (res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
                if (res.statusCode != 200) {
                    //console.log(mark);
                    logger_1.logger.error('KuaiQuCaiPush Fail: {Code:' + res.statusCode + ',PackageId: ' + data["PackageId"] + ',Type:' + data["StateName"] + ',Datetime:' + timestamp + ',Message:' + chunk + '}');
                    result = false;
                }
                else {
                    let resultOblect = JSON.parse(chunk);
                    if (Number(resultOblect.DATA.SUCCESS_NUM) < 1) {
                        // 此情况说明接口认证没有问题，但是可能数据上不符合，所以返回 true， 记录错误信息 继续执行；
                        //console.log('Fail: Casmart Packageid: ' + data["PackageId"] + ' Type:' + data["StateName"] + ' Datetime:' + timestamp + ' Message:' + chunk);
                        logger_1.logger.error('KuaiQuCaiPush Fail:{ Code:' + res.statusCode + ',PackageId:' + data["PackageId"] + ',Type:' + data["StateName"] + ',Datetime:' + timestamp + ',Message:' + chunk + '}');
                        result = true; // false;
                    }
                    else {
                        console.log('KuaiQuCaiPush Success: { PackageId: ' + data["PackageId"] + ',Type:' + data["StateName"] + ',Datetime:' + timestamp + ',Message:' + chunk + '}');
                        result = true;
                    }
                }
            });
        });
        req.on('error', function (e) {
            //console.log('problem with request: ' + e.message);
            logger_1.logger.error('KuaiQuCaiPush Error:{ Code:None, PackageId: ' + data["PackageId"] + ',Type: ' + data["StateName"] + ',Datetime:' + timestamp + ',Message:' + e.message + '}');
            result = false;
        });
        req.write(postData);
        req.end();
        return result;
    }
    catch (error) {
        logger_1.logger.error(error);
        throw error;
    }
}
exports.KuaiQuCaiPullWrite = KuaiQuCaiPullWrite;
//# sourceMappingURL=kuaiqucaiPullWrite.js.map