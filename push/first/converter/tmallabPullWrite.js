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
//喀斯玛接口相关配置
const casmartApiSetting = config_1.default.get("casmartApi");
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
    let { rid, 货号, 品牌, 包装规格, CAS, 目录价str, 中文名称, 英文名称, 交货期, 储存温度, 纯度等级, 库存, MarketingID, templateTypeId, stateName, isDelete } = body;
    try {
        //console.log(body);
        let result = false;
        let { hostname, appid, secret, addPath, updatePath } = casmartApiSetting;
        let datetime = Date.now();
        //let timestamp = format(datetime + 8 * 3600 * 1000, 'yyyy-MM-dd HH:mm:ss');
        let timestamp = date_fns_1.format(datetime, 'yyyy-MM-dd HH:mm:ss');
        //let postData = {};
        let options = {
            hostname: hostname,
            path: '',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8;'
            }
        };
        //产品下架的情况
        if (isDelete == '1') {
            let deleteData = {};
            let deleteJson = JSON.stringify(deleteData);
            let md5Str = md5(appid + deleteJson + timestamp + secret);
            let deleteProductPath = encodeURI(updatePath + '?appid=' + appid + '&data=' + deleteJson + '&t=' + timestamp + '&sign=' + md5Str);
            options.path = deleteProductPath;
        }
        else {
            //新增产品上架情况
            if (stateName == 'add') {
            }
            else {
                //修改产品信息
            }
        }
        //调用平台的接口推送数据，并返回结果
        let optionData = await HttpRequestHelper_1.HttpRequest_GET(options);
        let postResult = JSON.parse(String(optionData));
        if (postResult.retCode != 0) {
            //
            if (postResult.retCode == 1 && stateName == 'edit' && postResult.message == '商家：448 未找到商品信息') {
            }
            //失败
            else {
                result = false;
                logger_1.logger.error('CasmartPush Fail: { retCode: ' + postResult.retCode + ', Packageid:' + rid + ',Type:' + stateName + ',Datetime:' + timestamp + ',Message:' + optionData + ' }');
            }
        }
        else {
            //成功
            result = true;
            console.log('CasmartPush Success: { Packageid: ' + rid + ', Type:' + stateName + ', Datetime:' + timestamp + ', Message:' + optionData + '}');
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