import { Joint, UqInTuid, UqIn, Tuid, MapUserToUq } from "uq-joint";
//import { Joint, UqInTuid, UqIn, Tuid, MapUserToUq } from "../../uq-joint";
import { format, differenceInHours, differenceInMinutes } from 'date-fns';
const md5 = require('md5');
import config from 'config';
import { logger } from "../../tools/logger";
import { HttpRequest_POST } from '../../tools/HttpRequestHelper';
// import { isNullOrUndefined } from "util";
import { StringUtils } from "../../tools/stringUtils";
import { GlobalVar } from '../../tools/globalVar';
import { createPrinter } from "typescript";
import { round } from "lodash";
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
        console.log(String(optionData));
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
            result = '耗材';
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
        } else if (brandName == 'Alfa Aesar') {
            result = 2;
        } else {
            result = deliveryCycle;
        }
    }
    return result;
}

// 获取品牌名称（平台上维护的品牌有些与我司数据库中名称有差异）
function GetBrandName(brandName: string): string {

    let result = "";
    if (brandName == "J&K") {
        result = '百灵威J&K';
    } else if (brandName == "Alfa") {
        result = 'Alfa Aesar';
    } else if (brandName == "Alfa Aesar") {
        result = 'Alfa Aesar';
    }
    else {
        result = brandName;
    }
    return result;
}

// 获取产品图片
function GetImg(brandName: string): any {

    let result = '';
    switch (brandName) {
        case 'J&K':
            result = 'https://www.jkchemical.com/static/casmart/JNK.png';
            break;
        case 'Amethyst':
            result = 'https://www.jkchemical.com/static/casmart/Amethyst.png';
            break;
        case 'Acros':
            result = 'https://www.jkchemical.com/static/casmart/Acros.png';
            break;
        case 'TCI':
            result = 'https://www.jkchemical.com/static/casmart/TCI.png';
            break;
        case 'SERVA':
            result = 'https://www.jkchemical.com/static/casmart/Serva.jpg';
            break;
        case 'Serva':
            result = 'https://www.jkchemical.com/static/casmart/Serva.jpg';
            break;
        case 'Fluorochem':
            result = 'https://www.jkchemical.com/static/casmart/Fluorochem.jpg';
            break;
        case 'AccuStandard':
            result = 'https://www.jkchemical.com/static/casmart/Accustandard.png';
            break;
        case 'Strem':
            result = 'https://www.jkchemical.com/static/casmart/Strem.png';
            break;
        case 'TRC':
            result = 'https://www.jkchemical.com/static/casmart/TRC.jpg';
            break;
        case 'Apollo':
            result = 'https://www.jkchemical.com/static/casmart/Apollo.jpg';
            break;
        case 'Cambridge Isotope Laboratories（CIL）':
            result = 'https://www.jkchemical.com/static/casmart/CIL.png';
            break;
        case 'Polymer Source':
            result = 'https://www.jkchemical.com/static/casmart/Polymersource.png';
            break;
        case 'Matrix':
            result = 'https://www.jkchemical.com/static/casmart/Matrix.png';
            break;
        case 'Rieke Metals':
            result = 'https://www.jkchemical.com/static/casmart/RiekeMetals.jpg';
            break;
        case 'Frontier':
            result = 'https://www.jkchemical.com/static/casmart/Frontier.png';
            break;
        case 'Wilmad':
            result = 'https://www.jkchemical.com/static/casmart/Wilmad.jpg';
            break;
        case '1-Material':
            result = 'https://www.jkchemical.com/static/casmart/1-Material.png';
            break;
        case 'Alfa':
            result = 'https://www.jkchemical.com/static/casmart/ALFA.jpg';
            break;
        case 'Alfa Aesar':
            result = 'https://www.jkchemical.com/static/casmart/ALFA.jpg';
            break;
        case 'Accela':
            result = 'https://www.jkchemical.com/static/casmart/accela.jpg';
            break;
        case 'J&K-Abel':
            result = 'https://www.jkchemical.com/static/casmart/JNKAbel.jpg';
            break;
        case 'J&K Scientific':
            result = 'https://www.jkchemical.com/static/casmart/JNKScientific_200416.png';
            break;
        case 'Echelon':
            result = 'https://www.jkchemical.com/static/casmart/Echelon1.jpg';
            break;
        default:
            result = 'https://www.jkchemical.com/image/map-jk.gif';
            break;
    }
    return result;
}

// 获取库存范围数据
function GetStockamount(brandName: string, amount: number): number {
    let result = 0;
    if (brandName == 'Acros') {
        result = 99
    }
    else if (brandName == 'TCI') {
        result = 99
    }
    else if (brandName == 'Alfa') {
        result = 99
    }
    else {
        if (amount > 0 && amount < 11) {
            result = 10;
        } else if (amount > 10 && amount < 21) {
            result = 20;
        } else if (amount > 20 && amount < 31) {
            result = 30;
        } else if (amount > 30 && amount < 40) {
            result = 40;
        } else if (amount > 40 && amount < 51) {
            result = 50;
        } else if (amount > 50 && amount < 61) {
            result = 60;
        } else if (amount > 60 && amount < 100) {
            result = 99;
        } else if (amount > 99) {
            result = 100;
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
        '品牌': GetBrandName(brandName),
        '货号': originalId,
        '包装规格': packageSize
    }]
}

// 获取新增或者修改格式数据
function GetAddOrEditFormat(brandName: any, originalId: any, packageSize: any, chineseName: any, englishName: any, catalogPrice: any, CAS: any, deliveryCycle: any
    , purity: any, MDL: any, jkid: any, typeId: any, stock: number) {
    return [{
        '品牌': GetBrandName(brandName),
        '货号': originalId,
        '包装规格': packageSize,
        '产品分类': GetProductType(typeId),
        '中文名称': chineseName,
        '英文名称': englishName,
        '主图': GetImg(brandName),
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
        'MDL': MDL.replace(' ', '').replace(' ', ''),
        '链接地址': GetDetaUrl(jkid),
        '库存': GetStockamount(brandName, stock)
    }];
}
// 获取促销产品格式数据
function GetCuXiaoFormat(brandName: any, originalId: any, packageSize: any, chineseName: any, englishName: any, catalogPrice: any, activeDiscount: any, CAS: any, deliveryCycle: any
    , purity: any, MDL: any, jkid: any, typeId: any, stock: number, pEndTime: any, isHazard: any) {

    let salePrice: any = round(catalogPrice * (1 - activeDiscount));
    if (isHazard == true) {
        salePrice = round(catalogPrice * (1 - activeDiscount)) + 10;
    }

    return [{
        '品牌': GetBrandName(brandName),
        '货号': originalId,
        '包装规格': packageSize,
        '产品分类': GetProductType(typeId),
        '售价': salePrice,
        '特惠结束时间': pEndTime,
        '平台编号': '全部',
        '中文名称': chineseName,
        '英文名称': englishName,
        '主图': GetImg(brandName),
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
        'MDL': MDL.replace(' ', '').replace(' ', ''),
        '链接地址': GetDetaUrl(jkid),
        '库存': GetStockamount(brandName, stock)
    }];
}

// 苏州大学为什么要特殊判断处理？ 是因为舒经理反馈苏大危险品需要加收10元，平台给出方案是按照促销产品的形式来处理，危险品单独设置价格;
function GetWeiXianFormatForSuDa(brandName: any, originalId: any, packageSize: any, chineseName: any, englishName: any, discount: any, salePrice: any, CAS: any, deliveryCycle: any
    , purity: any, MDL: any, jkid: any, typeId: any, stock: number) {
    return [{
        '品牌': GetBrandName(brandName),
        '货号': originalId,
        '包装规格': packageSize,
        '产品分类': GetProductType(typeId),
        '售价': round(salePrice + 13),
        '特惠结束时间': format(new Date('2021-12-31 23:59:50'), 'yyyy-MM-dd HH:mm:ss'),   // ptm:9605966 汤施丹反馈使用此时间作为结束时间；
        '平台编号': 'suda',
        '中文名称': chineseName,
        '英文名称': englishName,
        '主图': GetImg(brandName),
        '目录价(RMB)': round((salePrice + 13) / discount),
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
        'MDL': MDL.replace(' ', '').replace(' ', ''),
        '链接地址': GetDetaUrl(jkid),
        '库存': GetStockamount(brandName, stock)
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

    let { loginname, ukey, hostname, gettokenPath, delproductPath, addproductPath, addproductPricePath } = cobazaarApiSetting;
    let { brandName, originalId, packageSize, chineseName, englishName, catalogPrice, CAS, deliveryCycle, stock, purity, MDL, jkid, typeId, stateName, isDelete,
        discount, activeDiscount, salePrice, pEndTime, isHazard } = body;
    let result = false;

    try {
        // 判断有没有获取到token信息

        if (StringUtils.isEmpty(GlobalVar.token) || StringUtils.isEmpty(GlobalVar.ucode) || StringUtils.isEmpty(GlobalVar.timestamp)) {
            await getTokenInfo(hostname, gettokenPath, loginname, ukey);
        }

        // 判断获取到的token信息有没有过期（接口token有效时间120分钟，此处设置为超过100分钟则重新获取）
        let strattTime: any = new Date(GlobalVar.timestamp);
        let endTime: any = new Date(Date.now() + 60000);
        let diffMinutes = round((endTime - strattTime) / (1000 * 60));

        if (diffMinutes > 100) {
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

        }
        else if (String(isDelete) == '0' && activeDiscount != '' && activeDiscount != null) {
            let promotionData = await GetCuXiaoFormat(brandName, originalId, packageSize, chineseName, englishName, catalogPrice, activeDiscount, CAS, deliveryCycle, purity, MDL, jkid, typeId, stock, pEndTime, isHazard);
            postOptions.path = addproductPricePath;
            postDataStr = JSON.stringify(promotionData);

        } else {
            let addData = await GetAddOrEditFormat(brandName, originalId, packageSize, chineseName, englishName, catalogPrice, CAS, deliveryCycle, purity, MDL, jkid, typeId, stock);
            postOptions.path = addproductPath;
            postDataStr = JSON.stringify(addData);
        }

        let requestData = qs.stringify({
            ucode: GlobalVar.ucode,
            token: GlobalVar.token,
            timestamp: GlobalVar.timestamp,
            reqcontent: postDataStr
        });

        // 调用平台的接口推送数据，并返回结果
        let optionData = await HttpRequest_POST(postOptions, requestData);
        let postResult = JSON.parse(String(optionData));

        if (postResult.flag == 0) {
            result = false;
            throw 'cobazaarPush Fail: { Id: ' + keyVal + ',Type:' + postOptions.path + ',Datetime:' + format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message: ' + optionData;

        } else {
            result = true;
            console.log('cobazaarPush Success: { Id: ' + keyVal + ',Type:' + postOptions.path + ',Datetime:' + format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message: ' + optionData);

            // 如果是危险品数据重新推送给苏州大学，增加10块
            // console.log(isHazard);
            if (isHazard == true && String(isDelete) == '0') {
                let sudaData = await GetWeiXianFormatForSuDa(brandName, originalId, packageSize, chineseName, englishName, discount, salePrice, CAS, deliveryCycle, purity, MDL, jkid, typeId, stock);
                postDataStr = JSON.stringify(sudaData);

                let requestDataAgain = qs.stringify({
                    ucode: GlobalVar.ucode,
                    token: GlobalVar.token,
                    timestamp: GlobalVar.timestamp,
                    reqcontent: postDataStr
                });
                postOptions.path = addproductPricePath;

                // 再次调用平台的接口推送数据，并返回结果
                let optionDataAgain = await HttpRequest_POST(postOptions, requestDataAgain);
                let postResultAgain = JSON.parse(String(optionDataAgain));

                if (postResultAgain.flag != 0) {
                    result = true;
                    console.log('cobazaarPush convertSuDa Success: { Id: ' + keyVal + ',Type:' + stateName + ',Datetime:' + format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message:' + optionDataAgain + '}');
                } else {
                    result = false;
                    throw 'cobazaarPush convertSuDa Fail:{ Code:' + postResultAgain.Code + ',queue_in:' + keyVal + ',Type:' + stateName + ',Datetime:' + format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message:' + optionDataAgain + '}';
                }
            } else {
                result = true;
            }

        }

        return result;

    } catch (error) {
        logger.error(error);
        throw error;
    }

}