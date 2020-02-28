"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
const http_1 = __importDefault(require("http"));
let md5 = require('md5');
const config_1 = __importDefault(require("config"));
const logger_1 = require("../../tools/logger");
const mapData_1 = require("../../uq-joint/tool/mapData");
//喀斯玛接口相关配置
const casmartApiSetting = config_1.default.get("casmartApi");
//获取产品分类
function GetCateId(Templatetypeid) {
    let result = '';
    switch (Templatetypeid) {
        case '1':
            result = '241';
            break;
        case '2':
            result = '241';
            break;
        case '3':
            result = '227';
            break;
        default:
            result = '241';
            break;
    }
    return result;
}
//获取品牌
function GetBrandId(brandName) {
    let result = '';
    switch (brandName) {
        case 'J&K':
            result = '734';
            break;
        case 'Amethyst':
            result = '734';
            break;
        case 'Acros':
            result = '734';
            break;
        case 'Sigma':
            result = '734';
            break;
        case 'TCI':
            result = '734';
            break;
        case 'Dr. Ehrenstorfer':
            result = '734';
            break;
        case 'SERVA':
            result = '734';
            break;
        case 'Fluorochem':
            result = '734';
            break;
        case 'Strem':
            result = '734';
            break;
        case 'LGC':
            result = '734';
            break;
        case 'TRC':
            result = '734';
            break;
        case 'Apollo':
            result = '734';
            break;
        case 'Cambridge Isotope Laboratories（CIL）':
            result = '734';
            break;
        case 'Frontier':
            result = '734';
            break;
        case 'Alfa':
            result = '734';
            break;
        case 'Echelon':
            result = '734';
            break;
    }
    return result;
}
function GetTypeId(templatetypeid) {
    let result = '';
    switch (templatetypeid) {
        case '1':
            result = '385'; //实验试剂->常用生化试剂 
            break;
        case '2':
            result = '385';
            break;
        case '3':
            result = '402'; //实验耗材->其他实验耗材
            break;
        default:
            result = '499'; //实验试剂->其他试剂和服务
            break;
    }
    return result;
}
async function CasmartPullWrite(joint, uqIn, data) {
    let { key, mapper, uq: uqFullName, entity: tuid } = uqIn;
    if (key === undefined)
        throw 'key is not defined';
    if (uqFullName === undefined)
        throw 'tuid ' + tuid + ' not defined';
    let keyVal = data[key];
    let mapToUq = new mapData_1.MapToUq(this);
    let body = await mapToUq.map(data, mapper);
    try {
        //定义变量
        //console.log(data);
        //console.log('喀斯玛接口处理');
        let result = false;
        let { host, appid, secret, addPath, updatePath } = casmartApiSetting;
        let timestamp = date_fns_1.format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        let postData = {};
        let options = {
            host: host,
            path: '',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;'
            }
        };
        //产品下架的情况
        if (data["isDelete"] == '1') {
            postData = {
                rid: data["rid"],
                isinsale: 0
            };
            let deleteJson = JSON.stringify(postData);
            let md5Str = md5(appid + deleteJson + timestamp + secret);
            let deleteProductPath = encodeURI(updatePath + '?appid=' + appid + '&data=' + deleteJson + '&t=' + timestamp + '&sign=' + md5Str);
            //console.log(deleteJson);
            //console.log(deleteProductPath);
            options.path = deleteProductPath;
        }
        else {
            //新增产品上架情况
            if (data["stateName"] == 'add') {
                //定义商品类型、产品分类、产品分组 
                let cateId = GetCateId(data["templateTypeId"]); //固定 241;
                let brandId = GetBrandId(data["brandName"]); //固定
                let typeId = GetTypeId(data["typeId"]); //产品分类，在sql查询中完成
                let groups = [424]; //商品分组信息是由商家在商家端自己添加的,添加商品前，必须添加自己商品分组信息
                postData = {
                    rid: data["rid"],
                    code: data["code"],
                    cateid: cateId,
                    brandid: brandId,
                    typeid: typeId,
                    name: data["name"],
                    subname: data["subname"],
                    mktprice: data["mktprice"],
                    price: data["price"],
                    unit: '瓶',
                    imgs: [],
                    stockamount: data["stockamount"],
                    isinsale: 1,
                    intro: data["intro"],
                    spec: data["spec"],
                    maker: data["brandName"],
                    packinglist: '',
                    service: '',
                    deliverycycle: data["deliverycycle"],
                    cascode: data["cascode"],
                    extends: [],
                    instructions: [],
                    groups: groups
                };
                let addJson = JSON.stringify(postData);
                let md5Str = md5(appid + addJson + timestamp + secret);
                let addProductPath = encodeURI(addPath + '?appid=' + appid + '&data=' + addJson + '&t=' + timestamp + '&sign=' + md5Str);
                //console.log(addJson);
                //console.log(addProductPath);
                options.path = addProductPath;
            }
            else {
                //修改产品信息
                postData = {
                    rid: data["rid"],
                    name: data["name"],
                    subname: data["subname"],
                    mktprice: data["mktprice"],
                    price: data["price"],
                    stockamount: data["stockamount"],
                    isinsale: 1,
                    intro: data["intro"],
                    instructions: [],
                    imgs: []
                };
                let updateJson = JSON.stringify(postData);
                let md5Str = md5(appid + updateJson + timestamp + secret);
                let updateProductPath = encodeURI(updatePath + '?appid=' + appid + '&data=' + updateJson + '&t=' + timestamp + '&sign=' + md5Str);
                //console.log(updateJson);
                //console.log(updateProductPath);
                options.path = updateProductPath;
            }
        }
        //使用定义好的接口数据 来推送.
        let req = http_1.default.request(options, function (res) {
            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            //console.log('STATUS: ' + res.statusCode);
            //res.setEncoding('utf8');
            res.on('data', function (chunk) {
                if (res.statusCode != 200) {
                    logger_1.logger.error('CasmartPush Fail: { Code: ' + res.statusCode + ', Packageid: ' + data["PackageId"] + ',Type: ' + data["StateName"] + ',Datetime: ' + timestamp + ',Message: ' + chunk + ' }');
                    req.end();
                    result = false;
                }
                else {
                    let resultOblect = JSON.parse(chunk);
                    if (String(resultOblect.retCode) == '1') {
                        // 此情况说明接口认证没有问题，但是可能数据上不符合，所以返回 true， 记录错误信息 继续执行；
                        //console.log('Fail: Casmart Packageid: ' + data["PackageId"] + ' Type:' + data["StateName"] + ' Datetime:' + timestamp + ' Message:' + chunk);
                        logger_1.logger.error('CasmartPush Fail: { Code: ' + res.statusCode + ',Packageid: ' + data["PackageId"] + ',Type:' + data["StateName"] + ',Datetime:' + timestamp + ',Message:' + chunk + '}');
                        req.end();
                        result = true;
                    }
                    else {
                        console.log('CasmartPush Success: { Packageid: ' + data["PackageId"] + ',Type:' + data["StateName"] + ',Datetime:' + timestamp + ',Message:' + chunk + '}');
                        result = true;
                    }
                }
            });
        });
        req.on('error', function (e) {
            //console.log('Error: Casmart Packageid: ' + data["PackageId"] + ' Type:' + data["StateName"] + ' Datetime:' + timestamp + ' Message:' + e.message);
            logger_1.logger.error('CasmartPush Error: { Code:None, Packageid: ' + data["PackageId"] + ',Type:' + data["StateName"] + ',Datetime:' + timestamp + ',Message:' + e.message + '}');
            result = false;
        });
        req.end();
        return result;
    }
    catch (error) {
        logger_1.logger.error(error);
        throw error;
    }
}
exports.CasmartPullWrite = CasmartPullWrite;
//# sourceMappingURL=casmartPullWrite.js.map