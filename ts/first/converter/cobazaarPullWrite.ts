import { Joint, UqInTuid, UqIn, Tuid, MapUserToUq } from "uq-joint";
//import { Joint, UqInTuid, UqIn, Tuid, MapUserToUq } from "../../uq-joint";
import _, { toPath } from 'lodash';
import { format, differenceInHours } from 'date-fns';
const md5 = require('md5');
import config from 'config';
import { logger } from "../../tools/logger";
import { HttpRequest_POST } from '../../tools/HttpRequestHelper';
import { isNullOrUndefined } from "util";
import { GlobalVar } from '../../tools/globalVar';
let qs = require('querystring');

// 库巴扎接口相关配置
const cobazaarApiSetting = config.get<any>("cobazaarApi");

// 获取Token接口信息
async function getTokenInfo(hostname: string, gettokenPath: string, loginname: string, ukey: string) {

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

    let optionData = await HttpRequest_POST(options, requestData);
    let postResult = JSON.parse(String(optionData));
    if (postResult.flag != 1) {
        throw ('获取token失败');
    }
    else {
        console.log(String(optionData));
        let result = postResult.rdate;
        GlobalVar.token = result[0].token;
        GlobalVar.ucode = result[0].ucode;
        GlobalVar.timestamp = result[0].timestamp;
    }
}

// 获取产品类型
function GetProductType(typeId: any): string {

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
function GetFutureDelivery(amount: number, brandName: string, deliveryCycle: number): number {

    let result = 3;
    if (amount > 0) {
        result = 1;
    } else {
        if (brandName == 'Acros') {
            result = 2;
        }
        else if (brandName == 'TCI') {
            result = 2;
        }
        else if (brandName == 'Alfa') {
            result = 2;
        } else {
            result = deliveryCycle;
        }
    }
    return result;
}

// 获取产品链接地址
function GetDetaUrl(JKid: string): any {
    let result = '';
    result = 'https://www.jkchemical.com/CH/Products/' + JKid + '.html';
    return result;
}

// 获取删除格式数据
function GetDeleteFormat(brandName: any, originalId: any, packageSize: any) {
    return [{
        品牌: brandName,
        货号: originalId,
        包装规格: packageSize
    }]
}

// 获取新增或者修改格式数据
function GetAddOrEditFormat(brandName: any, originalId: any, packageSize: any, chineseName: any, englishName: any, catalogPrice: any, CAS: any, deliveryCycle: any
    , purity: any, MDL: any, jkid: any, typeId: any, stock: number) {
    return [{
        '品牌': brandName,
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
export async function CobazaarPullWrite(joint: Joint, uqIn: UqIn, data: any): Promise<boolean> {

    let { key, mapper, uq: uqFullName, entity: tuid } = uqIn as UqInTuid;
    if (key === undefined) throw 'key is not defined';
    if (uqFullName === undefined) throw 'tuid ' + tuid + ' not defined';
    let keyVal = data[key];
    let mapToUq = new MapUserToUq(joint);
    let body = await mapToUq.map(data, mapper);

    let { loginname, ukey, hostname, gettokenPath, delproductPath, addproduct } = cobazaarApiSetting;
    let { brandName, originalId, packageSize, chineseName, englishName, catalogPrice, CAS, deliveryCycle, stock, purity, MDL, jkid, typeId, stateName, isDelete } = body;
    let result = false;

    try {
        // 判断有没有获取到token信息
        if (isNullOrUndefined(GlobalVar.token) || isNullOrUndefined(GlobalVar.ucode) || isNullOrUndefined(GlobalVar.timestamp)) {
            await getTokenInfo(hostname, gettokenPath, loginname, ukey);
        }

        // 判断获取到的token信息有没有过期（接口token有效时间60分钟，此处设置为超过50分钟则重新获取）
        if (differenceInHours(new Date(GlobalVar.timestamp), Date.now()) > 50) {
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

        } else {
            let addData = await GetAddOrEditFormat(brandName, originalId, packageSize, chineseName, englishName, catalogPrice, CAS, deliveryCycle, purity, MDL, jkid, typeId, stock);
            console.log(addData);
            postOptions.path = addproduct;
            postDataStr = JSON.stringify(addData);
        }

        let requestData = qs.stringify({
            ucode: GlobalVar.ucode,
            token: GlobalVar.token,
            timestamp: GlobalVar.timestamp,
            reqcontent: postDataStr
        });
        console.log(postDataStr); console.log(postOptions);
        console.log(requestData);
        // 调用平台的接口推送数据，并返回结果
        let optionData = await HttpRequest_POST(postOptions, requestData);
        console.log(optionData);
        let postResult = JSON.parse(String(optionData));

        if (postResult.flag == 0) {
            result = false;
            throw 'cobazaarPush Fail: { Id: ' + keyVal + ',Type:' + postOptions.path + ',Datetime:' + format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message: ' + optionData;

        } else {
            result = true;
            console.log('cobazaarPush Success: { Id: ' + keyVal + ',Type:' + postOptions.path + ',Datetime:' + format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message: ' + optionData);
        }

        return result;

    } catch (error) {
        logger.error(error);
        throw error;
    }

}