import { Joint, UqInTuid, UqIn, Tuid, MapUserToUq } from "uq-joint";
//import { Joint, UqInTuid, UqIn, Tuid, MapUserToUq } from "../../uq-joint";
import { format, differenceInHours, differenceInMinutes } from 'date-fns';
const md5 = require('md5');
import config from 'config';
import { logger } from "../../tools/logger";
import { HttpRequest_POST } from '../../tools/HttpRequestHelper';
import { StringUtils } from "../../tools/stringUtils";
import { GlobalVar } from '../../tools/globalVar';
import { round } from "lodash";
import { matching } from "../../tools/matching";
let qs = require('querystring');

// 库巴扎接口相关配置
const cobazaarApiSetting = config.get<any>("cobazaarApi");

/**
 * 推送
 * @param joint 
 * @param uqIn 
 * @param data 
 * @returns 
 */
export async function CobazaarPullWrite(joint: Joint, uqIn: UqIn, data: any): Promise<boolean> {

    let { key, mapper, uq: uqFullName, entity: tuid } = uqIn as UqInTuid;
    if (key === undefined) throw 'key is not defined';
    if (uqFullName === undefined) throw 'tuid ' + tuid + ' not defined';
    let keyVal = data[key];
    let mapToUq = new MapUserToUq(joint);
    let body = await mapToUq.map(data, mapper);

    let { loginname, ukey, hostname, gettokenPath, delproductPath, addproductPath, addproductPricePath } = cobazaarApiSetting;
    let { brandName, originalId, packageSize, chineseName, englishName, catalogPrice, CAS, deliveryCycle, stock, purity, MDL, jkid, typeId, stateName, isDelete,
        discount, activeDiscount, salePrice, pEndTime, isHazard, packnr, quantity, unit } = body;
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
        else if (String(isDelete) == '0' && StringUtils.isNotEmpty(activeDiscount)) {
            let promotionData = await GetCuXiaoFormat(brandName, originalId, packageSize, chineseName, englishName, catalogPrice, activeDiscount, CAS, deliveryCycle, purity, MDL, jkid, typeId, stock, pEndTime, packnr, quantity, unit);
            postOptions.path = addproductPricePath;
            postDataStr = JSON.stringify(promotionData);

        } else {
            let addData = await GetAddOrEditFormat(brandName, originalId, packageSize, chineseName, englishName, catalogPrice, CAS, deliveryCycle, purity, MDL, jkid, typeId, stock, packnr, quantity, unit);
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
            if (isHazard == true && String(isDelete) == '0' && StringUtils.isEmpty(activeDiscount)) {
                let sudaData = await GetWeiXianFormatForSuDa(brandName, originalId, packageSize, chineseName, englishName, catalogPrice, CAS, deliveryCycle, purity, MDL, jkid, typeId, stock, packnr, quantity, unit);
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
async function GetProductType(typeId: any, brandName: String, packnr: number, quantity: number, unit: string): Promise<any> {

    let result = { ProductType: "", QualityGrade: "", 容量: "", 容量单位: "" };
    //let packageUnit = await ConvertPackage(pachage);
    let capacity: any = packnr * quantity;
    switch (typeId) {
        case 1:
            result.ProductType = '化学试剂';
            if (brandName == "AccuStandard" || brandName == "Dr. Ehrenstorfer") {
                result.QualityGrade = 'JZ';
            }
            else {
                result.QualityGrade = 'EP';
            }
            result.容量 = capacity;
            result.容量单位 = unit;
            break;
        case 2:
            result.ProductType = '生物试剂';
            result.容量 = capacity;
            result.容量单位 = unit;
            result.QualityGrade = 'BR';
            break;
        case 3:
            result.ProductType = '耗材';
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
            result = 7;
        }
        else if (brandName == 'TCI') {
            result = 4;
        }
        else if (brandName == 'Alfa') {
            result = 7;
        } else if (brandName == 'Alfa Aesar') {
            result = 7;
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
    } else if (brandName == 'Alfa Aesar') {
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
async function GetDeleteFormat(brandName: any, originalId: any, packageSize: any) {
    return [{
        '品牌': GetBrandName(brandName),
        '货号': originalId,
        '包装规格': packageSize
    }]
}

async function ConvertPackage(packages: string): Promise<any> {

    try {
        let radiox: number = 1;
        let radioy: any;
        let unit: string;
        //判断是否包含汉字
        var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
        if (reg.test(packages)) {

            return { 容量: "", 容量单位: "" };
        }

        // 判断识别套包装的情况
        let count = packages.indexOf('x');
        if (count > 0) {
            let packageArray = packages.split('x');
            radiox = Number(packageArray[0]);
            let packageSizeSplt = packageArray[1];
            if (packageSizeSplt == '') {
                radioy = await matching(packages, 'number');
                unit = await matching(packages, 'letter');
            } else {
                radioy = await matching(packageSizeSplt, 'number');
                unit = await matching(packageSizeSplt, 'letter');
            }

        } else {
            radioy = await matching(packages, 'number');
            unit = await matching(packages, 'letter');
        }
        return { 容量: radiox * radioy, 容量单位: unit };
    } catch (error) {
        throw error;
    }

}

/**
 * AccuStandard 产品全部加标样二字 之后反馈加过了 是有的产品需要加混标 所以没有用
 * @param ChineseName 
 * @param brandName 
 * @returns 
 */
async function EditChineseName(ChineseName: string, brandName: string) {
    let index = ChineseName.indexOf("标样");
    if (brandName == "AccuStandard" && index > 0)
        return ChineseName + " | 标样";
    else
        return ChineseName;

}

function getBrandDiscount(brandName: string): any {

    let result: any;
    switch (brandName) {
        case 'J&K':
            result = 0.78;
            break;
        case 'Amethyst':
            result = 0.78;
            break;
        case 'Acros':
            result = 0.9;
            break;
        case 'TCI':
            result = 0.8;
            break;
        case 'Fluorochem':
            result = 0.85;
            break;
        case 'Strem':
            result = 0.85;
            break;
        case 'TRC':
            result = 0.85;
            break;
        case 'Apollo':
            result = 0.85;
            break;
        case 'Polymer Source':
            result = 0.85;
            break;
        case 'Matrix':
            result = 0.85;
            break;
        case 'Rieke Metals':
            result = 0.9;
            break;
        case 'Frontier':
            result = 0.85;
            break;
        case 'Wilmad':
            result = 0.8;
            break;
        case '1-Material':
            result = 0.75;
            break;
        case 'Alfa':
            result = 0.8;
            break;
        case 'Alfa Aesar':
            result = 0.8;
            break;
        case 'Accela':
            result = 0.9;
            break;
        case 'Echelon':
            result = 0.9;
            break;
        default:
            result = 1;
            break;
    }
    return result;
}

// 获取新增或者修改格式数据
async function GetAddOrEditFormat(brandName: any, originalId: any, packageSize: any, chineseName: any, englishName: any, catalogPrice: any, CAS: any, deliveryCycle: any
    , purity: any, MDL: any, jkid: any, typeId: any, stock: number, packnr: number, quantity: number, unit: string) {

    let ProductType = await GetProductType(typeId, brandName, packnr, quantity, unit);
    return [{
        '品牌': GetBrandName(brandName),
        '货号': originalId,
        '包装规格': packageSize,
        '产品分类': ProductType.ProductType,
        '中文名称': chineseName,
        '英文名称': englishName,
        '主图': GetImg(brandName),
        '目录价(RMB)': catalogPrice,
        'CAS': CAS,
        '质量等级': ProductType.QualityGrade,
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
        '库存': GetStockamount(brandName, stock),
        '容量': ProductType.容量,
        '容量单位': ProductType.容量单位
    }];
}
// 获取促销产品格式数据
async function GetCuXiaoFormat(brandName: any, originalId: any, packageSize: any, chineseName: any, englishName: any, catalogPrice: any, activeDiscount: any, CAS: any, deliveryCycle: any
    , purity: any, MDL: any, jkid: any, typeId: any, stock: number, pEndTime: any, packnr: number, quantity: number, unit: string) {

    let salePrice: any = round(catalogPrice * (1 - activeDiscount));
    let ProductType = await GetProductType(typeId, brandName, packnr, quantity, unit);
    return [{
        '品牌': GetBrandName(brandName),
        '货号': originalId,
        '包装规格': packageSize,
        '产品分类': ProductType.ProductType,
        '售价': salePrice,
        '特惠结束时间': pEndTime,
        '平台编号': '全部',
        '中文名称': chineseName,
        '英文名称': englishName,
        '主图': GetImg(brandName),
        '目录价(RMB)': catalogPrice,
        'CAS': CAS,
        '质量等级': ProductType.QualityGrade,
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
        '库存': GetStockamount(brandName, stock),
        '容量': ProductType.容量,
        '容量单位': ProductType.容量单位
    }];
}

// 苏州大学为什么要特殊判断处理？ 是因为舒经理反馈苏大危险品需要加收10元，平台给出方案是按照促销产品的形式来处理，危险品单独设置价格;
async function GetWeiXianFormatForSuDa(brandName: any, originalId: any, packageSize: any, chineseName: any, englishName: any, catalogPrice: any, CAS: any, deliveryCycle: any
    , purity: any, MDL: any, jkid: any, typeId: any, stock: number, packnr: number, quantity: number, unit: string) {

    let discount: any = getBrandDiscount(brandName);
    let salePrice: any = round((catalogPrice * discount) + 10);
    let ProductType = await GetProductType(typeId, brandName, packnr, quantity, unit);
    return [{
        '品牌': GetBrandName(brandName),
        '货号': originalId,
        '包装规格': packageSize,
        '产品分类': ProductType.ProductType,
        '售价': salePrice,
        '特惠结束时间': format(new Date('2021-12-31 23:59:50'), 'yyyy-MM-dd HH:mm:ss'),   // ptm:9605966 汤施丹反馈使用此时间作为结束时间；
        '平台编号': 'suda',
        '中文名称': chineseName,
        '英文名称': englishName,
        '主图': GetImg(brandName),
        '目录价(RMB)': round(catalogPrice),
        'CAS': CAS,
        '质量等级': ProductType.QualityGrade,
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
        '库存': GetStockamount(brandName, stock),
        '容量': ProductType.容量,
        '容量单位': ProductType.容量单位
    }];
}

