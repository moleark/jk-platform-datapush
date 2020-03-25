import { Joint } from "uq-joint";
//import { Joint } from "../../uq-joint";
import _ from 'lodash';
import { format } from 'date-fns';
import http from 'http';
let md5 = require('md5');
import config from 'config';
import { logger } from "../../tools/logger";
import { DateTimeOffset } from "mssql";
//import { MapToUq } from "../../uq-joint/tool/mapData";

//喀斯玛接口相关配置
const casmartApiSetting = config.get<any>("casmartApi");


//获取产品类型
function GetCateId(Templatetypeid: string): string {

    // 3：试剂耗材等其他商品，普通的试剂耗材商品，不包含危化品，不支持上传“纯度”、“cas”、“分子式”等扩展信息；
    // 5：化学试剂（包括危化品），包含危化品分类的，支持上传 “纯度”、“cas”、“分子式” 信息；

    let result = '';
    switch (Templatetypeid) {

        case '1':
            result = '5';
            break;
        case '2':
            result = '5';
            break;
        case '3':
            result = '3';
            break;
        default:
            result = '5';
            break;
    }
    return result;
}

//获取产品分组
function GetGroups(Templatetypeid: string): any[] {

    let result = [];
    switch (Templatetypeid) {

        case '1':
            result = [3363];
            break;
        case '2':
            result = [300029586];
            break;
        case '3':
            result = [3364];
            break;
        default:
            result = [3363];
            break;
    }
    return result;
}

//获取扩展属性
function GetExtends(templateTypeId: string, intro: string, cascode: string, mf: string): any[] {

    let result = [];
    switch (templateTypeId) {
        case '1':
            result = [{ "key": 9, "value": intro }, { "key": 10, "value": cascode }, { "key": 11, "value": mf }]
            break;
        case '2':
            result = [{ "key": 9, "value": intro }, { "key": 11, "value": mf }]
            break;
        default:
            result = [];
            break;
    }
    return result;
}

//获取品牌
function GetBrandId(brandName: string): string {

    let result = '';
    switch (brandName) {
        case 'J&K':
            result = '300150934';
            break;
        case 'Amethyst':
            result = '2029';
            break;
        case 'Acros':
            result = '462';
            break;
        case 'TCI':
            result = '25485';
            break;
        case 'Dr. Ehrenstorfer':
            result = '8160';
            break;
        case 'SERVA':
            result = '193';
            break;
        case 'Fluorochem':
            result = '5578';
            break;
        case 'AccuStandard':
            result = '554';
            break;
        case 'Strem':
            result = '1523';
            break;
        case 'TRC':
            result = '1262';
            break;
        case 'Apollo':
            result = '988';
            break;
        case 'Cambridge Isotope Laboratories（CIL）':
            result = '1279';
            break;
        case 'ChromaDex':
            result = '383';
            break;
        case 'Polymer Source':
            result = '8163';
            break;
        case 'Matrix':
            result = '2794';
            break;
        case 'Rieke Metals':
            result = '8159';
            break;
        case 'Frontier':
            result = '2025';
            break;
        case 'ADS':
            result = '3232';
            break;
        case 'Wilmad':
            result = '2328';
            break;
        case 'Echelon':
            result = '2493';
            break;
        case '1-Material':
            result = '8158';
            break;
        case 'J&K-Abel':
            result = '300150934';
            break;
        case 'J&K Scientific':
            result = '300150934';
            break;
        case 'Accela':
            result = '2233';
            break;
        case '3M':
            result = '418';
            break;
        case 'Delta':
            result = ':300067922';
            break;
    }
    return result;
}

//获取商品分类
function GetTypeId(iswx: string, typeId: string): string {
    let result = '';
    switch (iswx) {

        case 'Yes':
            result = '521';     //危险品使用521：化学试剂->危险化学品->普通危险化学品
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


export async function CasmartPullWrite(joint: Joint, data: any): Promise<boolean> {

    /*
    let { key, mapper, uq: uqFullName, entity: tuid } = uqIn as UqInTuid;
    if (key === undefined) throw 'key is not defined';
    if (uqFullName === undefined) throw 'tuid ' + tuid + ' not defined';
    let keyVal = data[key];
    let mapToUq = new MapToUq(this);
    let body = await mapToUq.map(data, mapper);
    */

    let body = data;

    try {

        //定义变量
        //console.log(data);
        //console.log('喀斯玛接口处理');
        let result = false;

        let { host, appid, secret, addPath, updatePath } = casmartApiSetting;
        let timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
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
        if (body["isDelete"] == '1') {

            postData = {
                rid: body["rid"],
                isinsale: 0
            };

            let deleteJson = JSON.stringify(postData);
            let md5Str = md5(appid + deleteJson + timestamp + secret);
            let deleteProductPath = encodeURI(updatePath + '?appid=' + appid + '&data=' + deleteJson + '&t=' + timestamp + '&sign=' + md5Str);

            //console.log(deleteJson);
            //console.log(deleteProductPath);
            options.path = deleteProductPath;

        } else {
            //新增产品上架情况
            if (body["stateName"] == 'add') {

                //定义商品类型、产品分类、产品分组 
                let cateId = GetCateId(body["templateTypeId"]); //固定 241;
                let brandId = GetBrandId(body["brandName"]);   //固定
                let typeId = GetTypeId(body["iswx"], body["typeId"]);       //产品分类，在sql查询中完成
                let groups = GetGroups(body["templateTypeId"]);   //商品分组信息是由商家在商家端自己添加的,添加商品前，必须添加自己商品分组信息;
                let extend = GetExtends(body["templateTypeId"], body["intro"], body["cascode"], body["mf"]);

                postData = {
                    rid: body["rid"],
                    code: body["code"],
                    cateid: cateId,
                    brandid: brandId,
                    typeid: typeId,
                    name: body["name"],
                    subname: body["subname"],
                    mktprice: body["mktprice"],
                    price: body["price"],
                    unit: '瓶',
                    imgs: [],
                    stockamount: body["stockamount"],
                    isinsale: 1,
                    intro: body["intro"],
                    spec: body["spec"],
                    maker: body["brandName"],
                    packinglist: '',
                    service: '',
                    deliverycycle: body["deliverycycle"],
                    cascode: body["cascode"],
                    extends: extend,
                    instructions: [],
                    groups: groups
                };

                let addJson = JSON.stringify(postData);
                let md5Str = md5(appid + addJson + timestamp + secret);
                let addProductPath = encodeURI(addPath + '?appid=' + appid + '&data=' + addJson + '&t=' + timestamp + '&sign=' + md5Str);

                //console.log(addJson);
                //console.log(addProductPath);
                options.path = addProductPath;

            } else {
                //修改产品信息
                postData = {
                    rid: body["rid"],
                    name: body["name"],
                    subname: body["subname"],
                    mktprice: body["mktprice"],
                    price: body["price"],
                    stockamount: body["stockamount"],
                    isinsale: 1,
                    intro: body["intro"],
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
        let req = http.request(options, function (res) {

            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            //console.log('STATUS: ' + res.statusCode);
            //res.setEncoding('utf8');
            res.on('data', function (chunk) {
                if (res.statusCode != 200) {

                    logger.error('CasmartPush Fail: { Code: ' + res.statusCode + ', Packageid: ' + body["PackageId"] + ',Type: ' + body["StateName"] + ',Datetime: ' + timestamp + ',Message: ' + chunk + ' }');
                    req.end();
                    result = false;
                } else {
                    let resultOblect = JSON.parse(chunk);
                    if (String(resultOblect.retCode) == '1') {
                        // 此情况说明接口认证没有问题，但是可能数据上不符合，所以返回 true， 记录错误信息 继续执行；
                        //console.log('Fail: Casmart Packageid: ' + body["PackageId"] + ' Type:' + body["StateName"] + ' Datetime:' + timestamp + ' Message:' + chunk);
                        logger.error('CasmartPush Fail: { Code: ' + res.statusCode + ',Packageid: ' + body["PackageId"] + ',Type:' + body["StateName"] + ',Datetime:' + timestamp + ',Message:' + chunk + '}');
                        req.end();
                        result = true;
                    }
                    else {
                        console.log('CasmartPush Success: { Packageid: ' + body["PackageId"] + ',Type:' + body["StateName"] + ',Datetime:' + timestamp + ',Message:' + chunk + '}');
                        result = true;
                    }
                }

            });
        });

        req.on('error', function (e) {
            //console.log('Error: Casmart Packageid: ' + body["PackageId"] + ' Type:' + body["StateName"] + ' Datetime:' + timestamp + ' Message:' + e.message);
            logger.error('CasmartPush Error: { Code:None, Packageid: ' + body["PackageId"] + ',Type:' + body["StateName"] + ',Datetime:' + timestamp + ',Message:' + e.message + '}');
            result = false;
        });

        req.end();
        return result;

    } catch (error) {
        logger.error(error);
        throw error;
    }
}
