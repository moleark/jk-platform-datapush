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
function GetExtends(templateTypeId: any, purity: string, cascode: string, mf: string): any[] {

    let result = [];
    let rPurity = purity.replace('+', '').replace('?', '').replace('#', '').replace('-', '').replace('&', '');
    switch (templateTypeId) {
        case 1:
            result = [{ "key": 9, "value": rPurity }, { "key": 10, "value": cascode }, { "key": 11, "value": mf }]
            break;
        case 2:
            result = [{ "key": 9, "value": rPurity }, { "key": 11, "value": mf }]
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
            result = 2720;
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

//获取生产厂家名称（J&K 中特殊符号报错）
function GetMaker(brandName: string): string {

    let result = '';

    if (brandName == 'J&K') {
        result = '百灵威';
    } else if (brandName == 'J&K Scientific') {
        result = '百灵威'
    } else if (brandName == 'J&K-Abel') {
        result = '百灵威'
    } else if (brandName == 'Dr. Ehrenstorfer') {
        result = 'Dr.Ehrenstorfer'
    } else if (brandName == 'Accustandard') {
        result = 'Accustandard'
    }
    else {
        result = brandName;
    }
    return result;
}

// 获取产品图片
function GetImg(brandName: string): any {

    let result = [];
    switch (brandName) {
        case 'J&K':
            result = ['https://www.jkchemical.com/static/casmart/JNK.png'];
            break;
        case 'Amethyst':
            result = ['https://www.jkchemical.com/static/casmart/Amethyst.png'];
            break;
        case 'Acros':
            result = ['https://www.jkchemical.com/static/casmart/Acros.png'];
            break;
        case 'TCI':
            result = ['https://www.jkchemical.com/static/casmart/TCI.png'];
            break;
        case 'SERVA':
            result = ['https://www.jkchemical.com/static/casmart/Serva.jpg'];
            break;
        case 'Serva':
            result = ['https://www.jkchemical.com/static/casmart/Serva.jpg'];
            break;
        case 'Fluorochem':
            result = ['https://www.jkchemical.com/static/casmart/Fluorochem.jpg'];
            break;
        case 'AccuStandard':
            result = ['https://www.jkchemical.com/static/casmart/Accustandard.png'];
            break;
        case 'Strem':
            result = ['https://www.jkchemical.com/static/casmart/Strem.png'];
            break;
        case 'TRC':
            result = ['https://www.jkchemical.com/static/casmart/TRC.jpg'];
            break;
        case 'Apollo':
            result = ['https://www.jkchemical.com/static/casmart/Apollo.jpg'];
            break;
        case 'Cambridge Isotope Laboratories（CIL）':
            result = ['https://www.jkchemical.com/static/casmart/CIL.png'];
            break;
        case 'Polymer Source':
            result = ['https://www.jkchemical.com/static/casmart/Polymersource.png'];
            break;
        case 'Matrix':
            result = ['https://www.jkchemical.com/static/casmart/Matrix.png'];
            break;
        case 'Rieke Metals':
            result = ['https://www.jkchemical.com/static/casmart/RiekeMetals.jpg'];
            break;
        case 'Frontier':
            result = ['https://www.jkchemical.com/static/casmart/Frontier.png'];
            break;
        case 'Wilmad':
            result = ['https://www.jkchemical.com/static/casmart/Wilmad.jpg'];
            break;
        case '1-Material':
            result = ['https://www.jkchemical.com/static/casmart/1-Material.png'];
            break;
        case 'Alfa':
            result = ['https://www.jkchemical.com/static/casmart/ALFA.jpg'];
            break;
        default:
            result = [''];
            break;
    }

    return result;
}

function GetName(name: string, subname: string, cascode: string): string {

    let result = '';
    if (name != null && name != '') {
        result += GetFarmetName(name) + ';';
    }
    if (subname != null && subname != '') {
        result += GetFarmetName(subname) + ';';
    }
    if (cascode != null && cascode != '0') {
        result += cascode + ';';
    }
    return result;
}

function GetSubname(subName: string): string {

    let result = '';
    if (subName != null) {
        result = GetFarmetName(subName);
    }
    return result;
}

function GetFarmetName(str: string): string {
    let result = '';
    //去除空格、反斜杠、括号、+- &
    //replace(/\s+/g, "")
    result = str.replace(/[/]/g, '').replace(/[#]/g, '').replace(/[(]/g, ' ').replace(/[)]/g, ' ').replace(/[（]/g, ' ').replace(/[）]/g, ' ').replace('+', '').replace('-', '').replace(/[&]/g, 'N').replace(/[:]/g, ' ');
    return result;
}

//喀斯玛平台限制库存为0的产品无法下订单，所以在此把库存为0的变为10 
function GetStockamount(amount: number): number {
    let result = 10;
    if (amount > 0) {
        result = amount;
    }
    return result;
}

function GetAddDataFormat(templateTypeId, rid, code, brandName, spec, cascode, mktprice, price, name, subname, deliverycycle, purity, mf, stockamount, typeId, iswx) {

    //定义商品类型、产品分类、产品分组 
    let cateId = GetCateId(iswx, typeId);  //商品分类，在sql查询中完成
    let brandId = GetBrandId(brandName);   //固定
    let type = GetTypeId(templateTypeId);  //商品类型
    let groups = GetGroups(templateTypeId);   //商品分组信息是由商家在商家端自己添加的,添加商品前，必须添加自己商品分组信息;
    let extend = GetExtends(templateTypeId, purity, cascode, mf);
    let maker = GetMaker(brandName);
    let cname = GetName(name, subname, cascode);
    let csubname = GetSubname(subname);
    let image = GetImg(brandName);
    let stock = GetStockamount(Number(stockamount));

    return {
        rid: rid,
        code: code,
        cateid: cateId,
        brandid: brandId,
        typeid: type,
        name: cname,
        subname: csubname,
        mktprice: mktprice,
        price: Math.round(price),
        unit: '瓶',
        imgs: image,
        stockamount: stock,
        isinsale: 1,
        intro: '',
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
}

function GetUpdateDataFormat(rid, brandName, cascode, mktprice, price, name, subname, stockamount) {

    let cname = GetName(name, subname, cascode);
    let csubname = GetSubname(subname);
    let stock = GetStockamount(Number(stockamount));
    let image = GetImg(brandName);
    return {
        rid: rid,
        name: cname,
        subname: csubname,
        mktprice: mktprice,
        price: Math.round(price),
        stockamount: stock,
        isinsale: 1,
        intro: '',
        instructions: [],
        imgs: image
    };
}


// 推送
export async function CasmartPullWrite(joint: Joint, uqIn: UqIn, data: any): Promise<boolean> {

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
        let timestamp = format(datetime + 8 * 3600 * 1000, 'yyyy-MM-dd HH:mm:ss');
        //let timestamp = format(datetime, 'yyyy-MM-dd HH:mm:ss');
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

                let addData = GetAddDataFormat(templateTypeId, rid, code, brandName, spec, cascode, mktprice, price, name, subname, deliverycycle, purity, mf, stockamount, typeId, iswx);
                let addJson = JSON.stringify(addData);
                let md5Str = md5(appid + addJson + timestamp + secret);
                let addProductPath = encodeURI(addPath + '?appid=' + appid + '&data=' + addJson + '&t=' + timestamp + '&sign=' + md5Str);
                options.path = addProductPath;

            } else {

                //修改产品信息
                let updateData = GetUpdateDataFormat(rid, brandName, cascode, mktprice, price, name, subname, stockamount);
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

            //不成功的原因是有区分的：1、平台上没有产品但是要修改却修改失败，这种情况转为新增；2、平台上存在产品但是要再次添加，这种情况转为修改； 3、平台上没有找到产品但是要删除，这种情况不用处理；
            //修改转新增
            if (postResult.retCode == 1 && stateName == 'edit' && postResult.message == '商家：448 未找到商品信息') {

                stateName = 'add';
                let addDataAgain = GetAddDataFormat(templateTypeId, rid, code, brandName, spec, cascode, mktprice, price, name, subname, deliverycycle, purity, mf, stockamount, typeId, iswx);
                let addJsonAgain = JSON.stringify(addDataAgain);
                let md5StrAgain = md5(appid + addJsonAgain + timestamp + secret);
                let addProductPathAgain = encodeURI(addPath + '?appid=' + appid + '&data=' + addJsonAgain + '&t=' + timestamp + '&sign=' + md5StrAgain);
                options.path = addProductPathAgain;
                //再次调用平台的接口推送数据，并返回结果
                let optionDataAgain = await HttpRequest_GET(options);
                let postResultAgain = JSON.parse(String(optionDataAgain));
                if (postResultAgain.retCode != 0) {
                    result = false;
                    logger.error('CasmartPush Fail: { retCode: ' + postResultAgain.retCode + ', Packageid:' + rid + ',Type:' + stateName + ',Datetime:' + timestamp + ',Message:' + optionDataAgain + ' }');
                } else {
                    result = true;
                    console.log('CasmartPush Success: { Packageid: ' + rid + ', Type: edit 转 ' + stateName + ', Datetime:' + timestamp + ', Message:' + optionDataAgain + '}');
                }

            }
            //新增转修改 
            else if (postResult.retCode == 1 && stateName == 'add' && postResult.message == '商品信息已同步') {
                stateName = 'edit';
                let updateDataAgain = GetUpdateDataFormat(rid, brandName, cascode, mktprice, price, name, subname, stockamount);
                let updateJsonAgain = JSON.stringify(updateDataAgain);
                let md5StrAgain = md5(appid + updateJsonAgain + timestamp + secret);
                let updateProductPathAgain = encodeURI(updatePath + '?appid=' + appid + '&data=' + updateJsonAgain + '&t=' + timestamp + '&sign=' + md5StrAgain);
                options.path = updateProductPathAgain;
                //再次调用平台的接口推送数据，并返回结果
                let optionDataAgain = await HttpRequest_GET(options);
                let postResultAgain = JSON.parse(String(optionDataAgain));
                if (postResultAgain.retCode != 0) {
                    result = false;
                    logger.error('CasmartPush Fail: { retCode: ' + postResultAgain.retCode + ', Packageid:' + rid + ',Type:' + stateName + ',Datetime:' + timestamp + ',Message:' + optionDataAgain + ' }');
                } else {
                    result = true;
                    console.log('CasmartPush Success: { Packageid: ' + rid + ', Type: add 转 ' + stateName + ', Datetime:' + timestamp + ', Message:' + optionDataAgain + '}');
                }
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
