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
//喀斯玛接口相关配置
const casmartApiSetting = config_1.default.get("casmarkApi");
//产品分类、类型、分组的处理
async function CasmartPullWrite(joint, data) {
    try {
        //定义变量
        //console.log(data);
        //console.log('喀斯玛接口处理');
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
        if (data["IsDelete"] == '1') {
            postData = {
                rid: data["PackageId"],
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
            if (data["StateName"] == 'add') {
                let groups = [424];
                postData = {
                    rid: data["PackageId"],
                    code: data["OriginalId"],
                    cateid: 241,
                    brandid: 734,
                    typeid: 385,
                    name: data["Description"],
                    subname: data["DescriptionC"],
                    mktprice: data["CatalogPrice"],
                    price: data["SalePrice"],
                    unit: '瓶',
                    imgs: [],
                    stockamount: data["Storage"],
                    isinsale: 1,
                    intro: data["Purity"],
                    spec: data["Package"],
                    maker: data["BrandName"],
                    packinglist: '',
                    service: '',
                    deliverycycle: data["Delivetime"],
                    cascode: data["CasFormat"],
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
                    rid: data["PackageId"],
                    name: data["Description"],
                    subname: data["DescriptionC"],
                    mktprice: data["CatalogPrice"],
                    price: data["SalePrice"],
                    stockamount: data["Storage"],
                    isinsale: 1,
                    intro: data["Purity"],
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
                    let mark = 'Fail: Casmart Packageid: ' + data["PackageId"] + ' Type:' + data["StateName"] + ' Datetime:' + timestamp + ' Message:' + chunk;
                    //console.log(mark);
                    logger_1.logger.error(mark);
                    req.end();
                    return false;
                }
                else {
                    let resultOblect = JSON.parse(chunk);
                    if (String(resultOblect.retCode) == '1') {
                        //console.log('Fail: Casmart Packageid: ' + data["PackageId"] + ' Type:' + data["StateName"] + ' Datetime:' + timestamp + ' Message:' + chunk);
                        logger_1.logger.error('Fail: Casmart Packageid: ' + data["PackageId"] + ' Type:' + data["StateName"] + ' Datetime:' + timestamp + ' Message:' + chunk);
                        req.end();
                        return false;
                    }
                    console.log('Success: Casmart Packageid: ' + data["PackageId"] + ' Type:' + data["StateName"] + ' Datetime:' + timestamp + ' Message:' + chunk);
                }
            });
        });
        req.on('error', function (e) {
            //console.log('Error: Casmart Packageid: ' + data["PackageId"] + ' Type:' + data["StateName"] + ' Datetime:' + timestamp + ' Message:' + e.message);
            logger_1.logger.error('Error: Casmart Packageid: ' + data["PackageId"] + ' Type:' + data["StateName"] + ' Datetime:' + timestamp + ' Message:' + e.message);
            req.end();
            return false;
        });
        req.end();
        return true;
    }
    catch (error) {
        logger_1.logger.error(error);
        throw error;
    }
}
exports.CasmartPullWrite = CasmartPullWrite;
//# sourceMappingURL=casmartPullWrite.js.map