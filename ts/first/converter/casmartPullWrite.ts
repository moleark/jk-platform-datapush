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


//获取产品类型
function GetCateId(iswx: string, typeId: number): number {
    let result = 516;
    switch (iswx) {

        case 'Yes':
            result = 521;     //危险品使用521：化学试剂->危险化学品->普通危险化学品
            break;
        case 'No':
            result = typeId;
            break;
        default:
            result = typeId;
            break;
    }
    return result;
}

//获取产品分组
function GetGroups(templatetypeid: any): any[] {

    let result = [];
    switch (templatetypeid) {

        case 1:
            result = [3363];
            break;
        case 2:
            result = [300029586];
            break;
        case 3:
            result = [3364];
            break;
        default:
            result = [3363];
            break;
    }
    return result;
}

//获取扩展属性
function GetExtends(templateTypeId: any, intro: string, cascode: string, mf: string): any[] {

    let result = [];
    switch (templateTypeId) {
        case 1:
            result = [{ "key": 9, "value": intro }, { "key": 10, "value": cascode }, { "key": 11, "value": mf }]
            break;
        case 2:
            result = [{ "key": 9, "value": intro }, { "key": 11, "value": mf }]
            break;
        default:
            result = [];
            break;
    }
    return result;
}

//获取品牌
function GetBrandId(brandName: string): number {

    let result = 0;
    switch (brandName) {
        case 'J&K':
            result = 300150934;
            break;
        case 'Amethyst':
            result = 2029;
            break;
        case 'Acros':
            result = 462;
            break;
        case 'TCI':
            result = 25485;
            break;
        case 'Dr. Ehrenstorfer':
            result = 8160;
            break;
        case 'SERVA':
            result = 193;
            break;
        case 'Fluorochem':
            result = 5578;
            break;
        case 'AccuStandard':
            result = 554;
            break;
        case 'Strem':
            result = 1523;
            break;
        case 'TRC':
            result = 1262;
            break;
        case 'Apollo':
            result = 988;
            break;
        case 'Cambridge Isotope Laboratories（CIL）':
            result = 1279;
            break;
        case 'ChromaDex':
            result = 383;
            break;
        case 'Polymer Source':
            result = 8163;
            break;
        case 'Matrix':
            result = 2794;
            break;
        case 'Rieke Metals':
            result = 8159;
            break;
        case 'Frontier':
            result = 2025;
            break;
        case 'ADS':
            result = 3232;
            break;
        case 'Wilmad':
            result = 2328;
            break;
        case 'Echelon':
            result = 2493;
            break;
        case '1-Material':
            result = 8158;
            break;
        case 'J&K-Abel':
            result = 300150934;
            break;
        case 'J&K Scientific':
            result = 300150934;
            break;
        case 'Accela':
            result = 2233;
            break;
        case '3M':
            result = 418;
            break;
        case 'Delta':
            result = 300067922;
            break;
        case 'LGC':
            result = 3064;
            break;
        case 'ADS':
            result = 3232;
            break;
        case 'Merk':
            result = 3276;
            break;
        case 'Key Organics':
            result = 4005;
            break;
        case 'Serva':
            result = 193;
            break;
        case 'accela':
            result = 2233;
            break;
    }
    return result;
}

//获取商品分类
function GetTypeId(templatetypeid: any): number {

    // 3：试剂耗材等其他商品，普通的试剂耗材商品，不包含危化品，不支持上传“纯度”、“cas”、“分子式”等扩展信息；
    // 5：化学试剂（包括危化品），包含危化品分类的，支持上传 “纯度”、“cas”、“分子式” 信息；

    let result = 5;
    switch (templatetypeid) {

        case 1:
            result = 5;
            break;
        case 2:
            result = 5;
            break;
        case 3:
            result = 3;
            break;
        default:
            result = 3;
            break;
    }
    return result;
}

function GetMaker(brandName: string): string {

    let result = '';

    if (brandName == 'J&K') {
        result = '百灵威';
    } else if (brandName == 'Dr. Ehrenstorfer') {
        result = 'Dr.Ehrenstorfer'
    }
    else {
        result = brandName;
    }
    return result;
}


export async function CasmartPullWrite(joint: Joint, uqIn: UqIn, data: any): Promise<boolean> {

    let { key, mapper, uq: uqFullName, entity: tuid } = uqIn as UqInTuid;
    if (key === undefined) throw 'key is not defined';
    if (uqFullName === undefined) throw 'tuid ' + tuid + ' not defined';
    let keyVal = data[key];
    //let mapToUq = new MapToUq(this);
    let mapToUq = new MapUserToUq(joint);
    let body = await mapToUq.map(data, mapper);
    let { templateTypeId, rid, code, brandName, spec, cascode, mktprice, price, name, subname, deliverycycle, intro, mf, stockamount,
        stateName, isDelete, typeId, iswx } = body;

    try {

        //定义变量
        //console.log(body);
        //console.log('喀斯玛接口处理');
        let result = false;

        let { host, appid, secret, addPath, updatePath } = casmartApiSetting;
        let timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        //let postData = {};
        let options = {
            host: host,
            path: '',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8;'
            }
        };

        //产品下架的情况
        if (isDelete == '1') {

            let deleteData = {
                rid: body["rid"],
                isinsale: 0
            };

            let deleteJson = JSON.stringify(deleteData);
            let md5Str = md5(appid + deleteJson + timestamp + secret);
            let deleteProductPath = encodeURI(updatePath + '?appid=' + appid + '&data=' + deleteJson + '&t=' + timestamp + '&sign=' + md5Str);
            options.path = deleteProductPath;

        } else {
            //新增产品上架情况
            if (stateName == 'add') {

                //定义商品类型、产品分类、产品分组 
                let cateId = GetCateId(iswx, typeId);  //商品分类，在sql查询中完成
                let brandId = GetBrandId(brandName);   //固定
                let type = GetTypeId(templateTypeId);  //商品类型
                let groups = GetGroups(templateTypeId);   //商品分组信息是由商家在商家端自己添加的,添加商品前，必须添加自己商品分组信息;
                let extend = GetExtends(templateTypeId, intro, cascode, mf);
                let maker = GetMaker(brandName);

                let addData = {
                    rid: rid,
                    code: code,
                    cateid: cateId,
                    brandid: brandId,
                    typeid: type,
                    name: name,
                    subname: subname,
                    mktprice: mktprice,
                    price: Math.round(price),
                    unit: '瓶',
                    imgs: [],
                    stockamount: Number(stockamount),
                    isinsale: 1,
                    intro: intro,
                    spec: spec,
                    maker: maker,
                    packinglist: '',
                    service: '',
                    deliverycycle: deliverycycle,
                    cascode: cascode,
                    extends: extend,
                    instructions: [],
                    groups: groups
                };

                let addJson = JSON.stringify(addData);
                let md5Str = md5(appid + addJson + timestamp + secret);
                let addProductPath = encodeURI(addPath + '?appid=' + appid + '&data=' + addJson + '&t=' + timestamp + '&sign=' + md5Str);
                options.path = addProductPath;

            } else {
                //修改产品信息
                let updateData = {
                    rid: rid,
                    name: name,
                    subname: subname,
                    mktprice: mktprice,
                    price: Math.round(price),
                    stockamount: stockamount,
                    isinsale: 1,
                    intro: intro,
                    instructions: [],
                    imgs: []
                };

                let updateJson = JSON.stringify(updateData);
                let md5Str = md5(appid + updateJson + timestamp + secret);
                let updateProductPath = encodeURI(updatePath + '?appid=' + appid + '&data=' + updateJson + '&t=' + timestamp + '&sign=' + md5Str);
                options.path = updateProductPath;
            }
        }

        //调用平台的接口推送数据，并返回结果
        let optionData = await HttpRequest_GET(options);
        let postResult = JSON.parse(String(optionData));

        if (postResult.retCode != 0) {

            logger.error('CasmartPush Fail: { retCode: ' + postResult.retCode + ', Packageid: ' + rid + ',Type: ' + stateName + ',Datetime: ' + timestamp + ',Message: ' + optionData + ' }');
            result = false;
        } else {
            console.log('CasmartPush Success: { Packageid: ' + rid + ', Type:' + stateName + ', Datetime:' + timestamp + ', Message:' + optionData + '}');
            result = true;
        }

        return result;

    } catch (error) {
        logger.error(error);
        throw error;
    }
}
