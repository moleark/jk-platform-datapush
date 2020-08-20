import { Joint, UqInTuid, UqIn, Tuid, MapUserToUq } from "uq-joint";
//import { Joint, UqInTuid, UqIn, Tuid, MapUserToUq } from "../../uq-joint";
import _ from 'lodash';
import { format, differenceInHours } from 'date-fns';
let md5 = require('md5');
import config from 'config';
import { logger } from "../../tools/logger";
import { HttpRequest_POST } from '../../tools/HttpRequestHelper';
import { isNullOrUndefined } from "util";
import { GlobalVar } from '../../tools/globalVar';

// 库巴扎接口相关配置
const cobazaarApiSetting = config.get<any>("tmallabApi");


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
    let postData = { "loginname": loginname, "ukey": ukey, "vcode": vcode }
    let optionData = HttpRequest_POST(options, postData);
    let postResult = JSON.parse(String(optionData));

    if (postResult.flag != 1) {
        throw ('获取token失败');
    }
    else {
        result = postResult.rdate;
        GlobalVar.token = result[0].token;
        GlobalVar.ucode = result[0].ucode;
        GlobalVar.timestamp = result[0].timestamp;
    }
}

export async function CobazaarPullWrite(joint: Joint, uqIn: UqIn, data: any): Promise<boolean> {

    let { key, mapper, uq: uqFullName, entity: tuid } = uqIn as UqInTuid;
    if (key === undefined) throw 'key is not defined';
    if (uqFullName === undefined) throw 'tuid ' + tuid + ' not defined';
    let keyVal = data[key];
    //let mapToUq = new MapToUq(this);
    let mapToUq = new MapUserToUq(joint);
    let body = await mapToUq.map(data, mapper);

    console.log(GlobalVar.timestamp);
    let { loginname, ukey, hostname, gettokenPath, delproductPath, addproduct } = cobazaarApiSetting;

    try {

        let result = false;
        let recordTime = format(Date.now(), 'yyyy-MM-dd HH:mm:ss'); // + 8 * 3600 * 1000

        if (isNullOrUndefined(GlobalVar.token) || isNullOrUndefined(GlobalVar.ucode) || isNullOrUndefined(GlobalVar.timestamp) || differenceInHours(GlobalVar.timestamp, Date.now()) > 50) {
            await getTokenInfo(hostname, gettokenPath, loginname, ukey);

        } else {

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

            } else {

                let addData = {
                    product: '',
                    productType: '',
                    vipCode: '',
                    platform: '',
                    appSecurity: '',
                    version: ''
                }
                postDataStr = JSON.stringify(addData);
            }

            // 调用平台的接口推送数据，并返回结果 
            let optionData = await HttpRequest_POST(postOptions, postDataStr);
            let postResult = JSON.parse(String(optionData));

            if (postResult.flag == 0) {
                result = false;
                console.log('cobazaarPush Fail: { PackageId: ' + body["COMPANY_SALE_NO"] + ',Type:' + postOptions.path + ',Datetime:' + recordTime + ',Message:平台不存在无需删除');


            } else {
                result = true;
                console.log('cobazaarPush Success: { PackageId: ' + body["COMPANY_SALE_NO"] + ',Type:' + postOptions.path + ',Datetime:' + recordTime + ',Message:平台不存在无需删除');
            }
        }

        return result;

    } catch (error) {
        logger.error(error);
        throw error;
    }

}