import { Joint, UqInTuid, UqIn, Tuid, MapUserToUq } from "uq-joint";
//import { Joint, UqInTuid, UqIn, Tuid, MapUserToUq } from "../../uq-joint";
import _ from 'lodash';
import { format } from 'date-fns';
let md5 = require('md5');
import config from 'config';
import { logger } from "../../tools/logger";
import { HttpRequest_GET } from '../../tools/HttpRequestHelper';


//喀斯玛接口相关配置
const casmartApiSetting = config.get<any>("casmartApi");

// 推送
export async function tmallabPullWrite(joint: Joint, uqIn: UqIn, data: any): Promise<boolean> {

    let { key, mapper, uq: uqFullName, entity: tuid } = uqIn as UqInTuid;
    if (key === undefined) throw 'key is not defined';
    if (uqFullName === undefined) throw 'tuid ' + tuid + ' not defined';
    let keyVal = data[key];
    //let mapToUq = new MapToUq(this);
    let mapToUq = new MapUserToUq(joint);
    let body = await mapToUq.map(data, mapper);
    let { templateTypeId, rid, code, brandName, spec, cascode, mktprice, price, name, subname, deliverycycle, purity, mf, stockamount,
        stateName, isDelete, typeId, iswx } = body;

    try {
        //console.log(body);
        let result = false;

        let { hostname, appid, secret, addPath, updatePath } = casmartApiSetting;
        let datetime = Date.now();
        //let timestamp = format(datetime + 8 * 3600 * 1000, 'yyyy-MM-dd HH:mm:ss');
        let timestamp = format(datetime, 'yyyy-MM-dd HH:mm:ss');
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

            let deleteData = {

            };

            let deleteJson = JSON.stringify(deleteData);
            let md5Str = md5(appid + deleteJson + timestamp + secret);
            let deleteProductPath = encodeURI(updatePath + '?appid=' + appid + '&data=' + deleteJson + '&t=' + timestamp + '&sign=' + md5Str);
            options.path = deleteProductPath;

        } else {
            //新增产品上架情况
            if (stateName == 'add') {



            } else {

                //修改产品信息

            }
        }

        //调用平台的接口推送数据，并返回结果
        let optionData = await HttpRequest_GET(options);
        let postResult = JSON.parse(String(optionData));

        if (postResult.retCode != 0) {

            //
            if (postResult.retCode == 1 && stateName == 'edit' && postResult.message == '商家：448 未找到商品信息') {

            }
            //失败
            else {
                result = false;
                logger.error('CasmartPush Fail: { retCode: ' + postResult.retCode + ', Packageid:' + rid + ',Type:' + stateName + ',Datetime:' + timestamp + ',Message:' + optionData + ' }');
            }

        } else {
            //成功
            result = true;
            console.log('CasmartPush Success: { Packageid: ' + rid + ', Type:' + stateName + ', Datetime:' + timestamp + ', Message:' + optionData + '}');
        }

        return result;

    } catch (error) {
        logger.error(error);
        throw error;
    }
}
