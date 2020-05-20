import { Joint, UqInTuid, UqIn, Tuid, MapUserToUq } from "uq-joint";
// import { Joint, UqInTuid, UqIn, Tuid } from "../../uq-joint";
import _ from 'lodash';
import { format, isSameWeek } from 'date-fns';
import http from 'http';
import { HttpRequest_GET, HttpRequest_POST } from '../../tools/HttpRequestHelper'
let md5 = require('md5');
import config from 'config';
import { logger } from "../../tools/logger";
import { isNullOrUndefined } from "util";


// 快去采接口相关配置
const kuaiQuCaiApiSetting = config.get<any>("kuaiQuCaiApi");

// 获取不同的chemid，化学试剂传cas号码、生物试剂传文档中固定的分类、耗材产品传''  
function GETCHEM_ID(templatetypeid, casFormat: string) {

    let result = ''
    switch (templatetypeid) {
        case 1:
            result = casFormat;
            break;
        case 2:
            result = 'SWSJ-007';  // 其他
            break;
        case 3:
            result = '';
            break;
    }
    return result;
}

// 获取化学品名称,优先传中文其次传英文
function GETCOMPANY_CHEM_NAME(templatetypeid, productName: string, productNameChinese: string): string {

    let result = '';
    if (templatetypeid == 1) {
        if (isNullOrUndefined(productNameChinese) || productNameChinese == '') {
            result = productName;
        } else {
            result = productNameChinese;
        }
    }
    return result.replace('', ' ').replace(/[/]/g, '').replace(/[%]/g, '');
}

// 获取生物试剂名称
function GETCOMPANY_BIO_NAME(templatetypeid, productName: string, productNameChinese: string): string {

    let result = '';
    if (templatetypeid == 2) {
        if (isNullOrUndefined(productNameChinese) || productNameChinese === '') {
            result = productName;
        } else {
            result = productNameChinese;
        }
    }
    return result.replace('', ' ').replace(/[/]/g, '').replace(/[%]/g, '').replace(/[<sup>]/g, '').replace(/[<//sup>]/g, '').replace(/[ε]/g, '');
}

// 获取耗材产品名称
function GETCOMPANY_CL_NAME(templatetypeid, productName: string, productNameChinese: string): string {

    let result = '';
    if (templatetypeid == 3) {
        if (isNullOrUndefined(productNameChinese) || productNameChinese === '') {
            result = productName;
        } else {
            result = productNameChinese;
        }
    }
    return result.replace('', ' ').replace(/[/]/g, '').replace(/[%]/g, '').replace(/[<sup>]/g, '').replace(/[<//sup>]/g, '').replace(/[ε]/g, '');;
}

// 获取发货时间，根据文档中不同的天数返回固定id (部分耗材产品没有发货时间)
function GETDELIVERYTIME_ID(storage: string, deliveryTime: string): string {

    let result = '';
    if (Number(storage) > 0) {
        result = "01";      // 跟舒经理核实，现货产品传最小时间单位
    } else {
        if (isNullOrUndefined(deliveryTime)) {
            result = '21';
        } else if (Number(deliveryTime) <= 9) {
            result = '0' + deliveryTime;
        }
        else if (Number(deliveryTime) <= 15) {
            result = deliveryTime;
        } else if (Number(deliveryTime) <= 21) {
            result = '21';
        } else if (Number(deliveryTime) <= 31) {
            result = '31';
        } else {
            result = '32';
        }
    }
    return result;
}

// 获取货期类型：1 现货, 2 期货(5个品牌是代理国产商品), 3 期货(代理进口商品);
function GETDELIVERY_TYPE_ID(storage: number, brandName: string): number {

    let result = 1;
    if (storage > 0) {
        result = 1;
    } else {
        switch (brandName) {
            case "J&K":
                result = 2;
                break;
            case "Amethyst":
                result = 2;
                break;
            case "J&K-Abel":
                result = 2;
                break;
            case "J&K Scientific":
                result = 2;
                break;
            case "Accela":
                result = 2;
                break;
            default:
                result = 3;
                break;
        }
    }
    return result;
}

// 获取厂商商品描述，平台反馈无法识别的套包装 可以在此处体现
function GETSPEC_MARK(packnr: any, packageSize: any, unit: string): string {

    let result: string = "";
    if (Number(packnr) > 1) {
        result = packnr + "*" + packageSize + unit + " 套包装; ";
    } else {
        result = "";
    }
    return result;
}

// 获取产品图片，仪器耗材（其它类型产品不传）现在统一为一张logo。逐步实现一个品牌一张照片然后一个产品一张照片；
function GetImg(templateTypeId): any {

    let result = [];
    if (templateTypeId == 3) {
        result = ['https://www.jkchemical.com/image/map-jk.gif'];
    }
    return result;
}

// 获取规格单位 
function GETSPEC_ID(templateTypeId, unit: string): string {

    let result = '';
    let convertunit = unit.trim().toUpperCase();
    if (templateTypeId == 1 || templateTypeId == 2) {
        result = '瓶';
    } else {
        if (convertunit == "PCS") {
            result = '个';
        } else if (convertunit == "PC") {
            result = '个';
        } else if (convertunit == "PIECE") {
            result = '个';
        } else if (convertunit == "PIECES") {
            result = '个';
        } else if (convertunit == "PC") {
            result = '个';
        } else if (convertunit == "PAIR") {
            result = '对';
        } else if (convertunit == "PAK") {
            result = '包';
        } else if (convertunit == "PACK") {
            result = '包';
        } else if (convertunit == "PK") {
            result = '包';
        } else if (convertunit == "PKG") {
            result = '包';
        } else if (convertunit == "BOX") {
            result = '盒'
        } else if (convertunit == "BAG") {
            result = '袋'
        } else if (convertunit == "G") {
            result = 'EA';
        } else if (convertunit == "KG") {
            result = 'EA';
        } else if (convertunit == "EACH") {
            result = 'EA';
        } else if (convertunit == "EA") {
            result = 'EA';
        } else if (convertunit == "APPLS") {
            result = 'EA';
        } else if (convertunit == "CS") {
            result = '套';
        } else if (convertunit == "KIT") {
            result = '套';
        } else if (convertunit == "SET") {
            result = '套';
        } else if (convertunit == "TABLETS") {
            result = '瓶';
        } else if (unit == "台") {
            result = '台';
        } else if (unit == "支") {
            result = 'EA';
        }
        else {
            result = 'none';
        }
    }
    return result;
}

//  获取容量单位，平台跟我司容量单位对应 
function GETVALUMEUNIT_ID(unit: string): string {

    let result = '';
    let convertunit = unit.trim().toUpperCase();
    if (convertunit == "MG") {
        result = 'mg';
    } else if (convertunit == "APPLS") {
        result = 'EA';
    } else if (convertunit == "BAG") {
        result = 'Pak';
    } else if (convertunit == "BOTTLES") {
        result = 'tablets';
    } else if (convertunit == "BOX") {
        result = 'Kit';
    } else if (convertunit == "CS") {
        result = 'Kit';
    } else if (convertunit == "CYL") {
        result = 'pc';
    } else if (convertunit == "DISC") {
        result = 'pc';
    } else if (convertunit == "EA" || convertunit.substr(0, 2) == "EA") {
        result = 'EA';
    } else if (convertunit == "G") {
        result = 'G';
    } else if (convertunit == "G0") {
        result = 'G'
    } else if (convertunit == "GM") {
        result = 'G'
    } else if (convertunit == "GR" || convertunit.substr(0, 2) == "GR") {
        result = 'G'
    } else if (convertunit == "KG") {
        result = 'Kg'
    } else if (convertunit == "KIT") {
        result = 'Kit'
    } else if (convertunit == "KU") {
        result = 'KU'
    } else if (convertunit == "L") {
        result = 'L'
    } else if (convertunit == "LT") {
        result = 'Lt'
    } else if (convertunit == "M") {
        result = 'M'
    } else if (convertunit == "ML") {
        result = 'ML'
    } else if (convertunit == "MM") {
        result = 'mm'
    } else if (convertunit == "MOLE") {
        result = 'mole'
    } else if (convertunit == "MU") {
        result = 'MU'
    } else if (convertunit == "NMOL") {
        result = 'nmol'
    } else if (convertunit == "NMOLE") {
        result = 'nmol'
    } else if (convertunit == "PACK") {
        result = 'Pak'
    } else if (convertunit == "PAIR") {
        result = 'pc'
    } else if (convertunit == "PAK") {
        result = 'Pak'
    } else if (convertunit == "PC") {
        result = 'pc'
    } else if (convertunit == "PCS") {
        result = 'pcs'
    } else if (convertunit == "PIECE") {
        result = 'PIECE'
    } else if (convertunit == "PIECES") {
        result = 'PIECE'
    } else if (convertunit == "PK" || convertunit == "PKG" || convertunit.substr(0, 2) == "PK") {
        result = 'Pak'
    } else if (convertunit == "SET") {
        result = 'SET'
    } else if (convertunit == "STRIPS") {
        result = 'pc'
    } else if (convertunit == "TABLETS") {
        result = 'tablets'
    } else if (convertunit == "U") {
        result = 'U'
    } else if (convertunit == "UG") {
        result = 'UG'
    } else if (convertunit == "UL") {
        result = 'UL'
    } else if (convertunit == "UMOL") {
        result = 'μmol'
    } else if (convertunit == "UN") {
        result = 'UN'
    } else if (convertunit == "UNIT") {
        result = 'unit'
    } else if (convertunit == "UNITS") {
        result = 'UNITS'
    } else if (convertunit == "VIAL") {
        result = 'VIAL'
    } else if (convertunit == "VIALS") {
        result = 'VIALS'
    } else if (convertunit == "VL") {
        result = 'VIALS'
    } else if (unit == "μg") {
        result = 'UG'
    } else if (unit == "μl") {
        result = 'μl'
    } else if (unit == "μmol") {
        result = 'μmol'
    } else if (unit == "米") {
        result = 'pc'
    } else if (unit == "台") {
        result = 'pc'
    } else if (unit == "支") {
        result = 'EA'
    }
    else {
        result = 'none';
    }
    return result;
}

// 获取品牌名称（平台上维护的品牌有些与我司数据库中名称有差异）
function GetBrandName(brandName: string): string {

    let result = "";
    if (brandName == "TCI") {
        result = 'TCI/梯希爱';
    } else if (brandName == "SERVA") {
        result = 'Serva';
    } else if (brandName == "ChromaDex") {
        result = 'Chromadex';
    } else if (brandName == "Dr. Ehrenstorfer") {
        result = 'Dr.Ehrenstorfer';
    }
    else {
        result = brandName;
    }
    return result;
}

// 获取生物试剂分类ID
function GetBIO_TYPE_ID(templatetypeid): string {

    let result = '';
    if (templatetypeid == 2) {
        result = '049'; // 其他
    }
    return result;
}

// 获取材料分类ID
function GetCL_TYPE_ID(templatetypeid): string {

    let result = '';
    if (templatetypeid == 3) {
        result = '02011';   // 实验耗材
    }
    return result;
}

// 获取包装（只有耗材产品使用）
function GetPACKAGE_TYPE(templatetypeid, packageSize: any, unit: string): string {

    let result = '';
    if (templatetypeid == 3) {
        result = String(packageSize) + unit;
    }
    return result;
}

// 对查询到的产品进行处理 
export async function KuaiQuCaiPullWrite(joint: Joint, uqIn: UqIn, data: any): Promise<boolean> {

    let { key, mapper, uq: uqFullName, entity: tuid } = uqIn as UqInTuid;
    if (key === undefined) throw 'key is not defined';
    if (uqFullName === undefined) throw 'tuid ' + tuid + ' not defined';
    let keyVal = data[key];
    // let mapToUq = new MapToUq(this);
    let mapToUq = new MapUserToUq(joint);
    let body = await mapToUq.map(data, mapper);

    try {
        // console.log(body);
        let result = false;

        let { companyId, key, hostname, chemAddPath, chemDetailPath, chemUpdatePath, chemDeletePath, bioAddPath, bioDetailPath,
            bioUpdatePath, bioDeletePath, clAddPath, clDetailPath, clUpdatePath, clDeletePath } = kuaiQuCaiApiSetting;
        let DateTime: number = Date.now();
        let timestamp = parseFloat((DateTime / 1000).toFixed());
        let token = md5(timestamp + companyId + key);
        let postDataStr = {};

        // 用于查询请求 
        let getOptions = {
            hostname: hostname,
            path: '',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'TIMESTAMP': timestamp,
                'COMPANY': companyId,
                'TOKEN': token
            }
        };

        // 调用平台查询产品详情接口判断产品是否存在，查询接口区分 化学品查询、生物试剂查询、耗材查询三个接口；
        switch (body["TemplateTypeId"]) {
            case 1:
                getOptions.path = chemDetailPath + '?COMPANY_SALE_NO=' + encodeURI(body["COMPANY_SALE_NO"]);
                break;
            case 2:
                getOptions.path = bioDetailPath + '?COMPANY_SALE_NO=' + encodeURI(body["COMPANY_SALE_NO"]);
                break;
            case 3:
                getOptions.path = clDetailPath + '?COMPANY_SALE_NO=' + encodeURI(body["COMPANY_SALE_NO"]);
                break;
            default:
                break;
        }

        // 删除的请求格式 跟 新增、修改 的 格式不一致，所以在此处分开判断 
        if (body["IsDelete"] == 1) {
            let deleteData = body["COMPANY_SALE_NO"];
            postDataStr = JSON.stringify({ COMPANY_SALE_NOS: deleteData });

        } else {
            //  统一的产品 json 数据，部分数据需要判断处理，所以增加了几个判断方法。
            let CHEM_ID = GETCHEM_ID(body["TemplateTypeId"], body["CasFormat"]);    // 获取ChemID,化学品传cas、生物试剂传参数固定的分类、耗材产品空着
            let COMPANY_CHEM_NAME = GETCOMPANY_CHEM_NAME(body["TemplateTypeId"], body["ProductName"], body["ProductNameChinese"]);  // 获取化学实际产品名称 
            let COMPANY_BIO_NAME = GETCOMPANY_BIO_NAME(body["TemplateTypeId"], body["ProductName"], body["ProductNameChinese"]);    // 获取生物试剂产品名称 
            let COMPANY_CL_NAME = GETCOMPANY_CL_NAME(body["TemplateTypeId"], body["ProductName"], body["ProductNameChinese"]);      // 获取耗材产品名称 
            let DELIVERYTIME_ID = GETDELIVERYTIME_ID(body["STOCK"], body["DELIVERYTIME"]);      // 获取送货时间
            let DELIVERY_TYPE_ID = GETDELIVERY_TYPE_ID(body["STOCK"], body["BRAND_NAME"]);     // 获取货期类型
            let SPEC_MARK = GETSPEC_MARK(body["PackNr"], body["VALUME"], body["VALUMEUNIT_ID"]);       // 规格描述
            let SPEC_ID = GETSPEC_ID(body["TemplateTypeId"], body["VALUMEUNIT_ID"]);             // 规格
            let VALUMEUNIT_ID = GETVALUMEUNIT_ID(body["VALUMEUNIT_ID"]);    //  容量单位
            let BRAND_NAME = GetBrandName(body["BRAND_NAME"]);   // 品牌名称
            let BIO_TYPE_ID = GetBIO_TYPE_ID(body["TemplateTypeId"]);
            let CL_TYPE_ID = GetCL_TYPE_ID(body["TemplateTypeId"]);
            let PACKAGE_TYPE = GetPACKAGE_TYPE(body["TemplateTypeId"], body["VALUME"], body["VALUMEUNIT_ID"]);
            let IMG = GetImg(body["TemplateTypeId"]);

            let postDataJson = {
                COMPANY_SALE_NO: body["COMPANY_SALE_NO"],
                CHEM_ID: CHEM_ID,
                COMPANY_CHEM_NAME: COMPANY_CHEM_NAME,
                COMPANY_BIO_NAME: COMPANY_BIO_NAME,
                COMPANY_CL_NAME: COMPANY_CL_NAME,
                PRICE: body["PRICE"],
                VALUMEUNIT_ID: VALUMEUNIT_ID,
                VALUME: body["VALUME"],
                SPEC_ID: SPEC_ID,
                SPEC_MARK: SPEC_MARK,
                SALE_MARK: 1,
                PURITY: body["PURITY"].substr(0, 19),
                STOCK: body["STOCK"],
                SRC_COMPANY: BRAND_NAME,
                ARTICLE_NO: body["ARTICLE_NO"],
                DISCOUNT_RATE: body["DISCOUNT_RATE"],
                DELIVERYTIME_ID: DELIVERYTIME_ID,
                DELIVERY_TYPE_ID: DELIVERY_TYPE_ID,
                COMPANY_DESC: SPEC_MARK,
                SUPPLY_COMPANY_ID: '162',       // 供应商ID
                SUPPLY_COMPANY: '百灵威',       // 供应商
                SALE_COMPANY_NAME: '北京百灵威科技有限公司',    // 供应商全称
                SALE_COMPANY_PHONE: '010-59309000',         // 供应商电话
                BRAND_NAME: BRAND_NAME,
                POSTAGE: 12,
                NO_POSTAGE_NUM: 0,
                BIO_TYPE_ID: BIO_TYPE_ID,
                CL_TYPE_ID: CL_TYPE_ID,
                PACKAGE_TYPE: PACKAGE_TYPE,
                IMG: IMG
            };
            postDataStr = JSON.stringify({ "DATA": [postDataJson] });
        }

        // 用于增加、修改、删除 请求 
        let postOptions = {
            hostname: hostname,
            path: '',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'TIMESTAMP': timestamp,
                'COMPANY': companyId,
                'TOKEN': token
            }
        };

        // 判断平台是否存在产品
        let queryPlatformIsExist = await HttpRequest_GET(getOptions);
        let queryResult = JSON.parse(String(queryPlatformIsExist));

        // 根据是否存在的结果执行后续步骤 
        if (queryResult.CODE != 200 || queryResult.MESSAGE != 'SUCCESS') {

            // 平台上查询不到，调用新增方法 
            if (body["IsDelete"] != 1) {

                // 判断产品类型，调用不同的接口地址  
                switch (body["TemplateTypeId"]) {
                    case 1:
                        postOptions.path = chemAddPath; // 化学试剂新增接口地址
                        break;
                    case 2:
                        postOptions.path = bioAddPath;  // 生物试剂新增接口地址
                        break;
                    case 3:
                        postOptions.path = clAddPath;   // 耗材新增接口地址
                        break;
                    default:
                        break;
                }
            } else {
                console.log('KuaiQuCaiPush Success: { PackageId: ' + body["COMPANY_SALE_NO"] + ',Type:' + postOptions.path + ',Datetime:' + Date.now() + ',Message:平台不存在无需删除');
                return true;
            }
        } else {

            // 能够查询到的情况，应该调用修改或者删除方法（删除方法考虑是否挪出去此判断，直接删除会不会速度快一点？）
            // 判断产品类型，调用不同的接口地址（化学试剂、生物试剂、仪器耗材对应的接口地址不一致）
            if (body["IsDelete"] == 1) {

                // 平台存在产品， 我司要删除的情况 
                switch (body["TemplateTypeId"]) {
                    case 1:
                        postOptions.path = chemDeletePath; // 化学试剂删除接口地址
                        break;
                    case 2:
                        postOptions.path = bioDeletePath;  // 生物试剂删除接口地址
                        break;
                    case 3:
                        postOptions.path = clDeletePath;   // 耗材删除接口地址
                        break;
                    default:
                        break;
                }
            } else {
                // 平台存在产品，我司要修改的情况                            
                switch (body["TemplateTypeId"]) {
                    case 1:
                        postOptions.path = chemUpdatePath;  // 化学试剂修改接口地址
                        break;
                    case 2:
                        postOptions.path = bioUpdatePath;   // 生物试剂修改接口地址
                        break;
                    case 3:
                        postOptions.path = clUpdatePath;    // 耗材修改接口地址
                        break;
                    default:
                        break;
                }
            }

        }

        // 调用平台的接口推送数据，并返回结果 
        let optionData = await HttpRequest_POST(postOptions, postDataStr);
        let postResult = JSON.parse(String(optionData));

        // 判断请求结果 并记录 
        if (postResult.CODE != 200) {
            logger.error('KuaiQuCaiPush Fail: {Code:' + postResult.CODE + ',PackageId: ' + body["COMPANY_SALE_NO"] + ',Type:' + postOptions.path + ',Datetime:' + Date.now() + ',Message:' + optionData + '}');
            result = false;

        } else {
            if (Number(postResult.DATA.SUCCESS_NUM) < 1) {
                //  此情况说明接口认证没有问题，但是可能数据上不符合，所以返回 true， 记录错误信息 继续执行；
                logger.error('KuaiQuCaiPush Fail:{ Code:' + postResult.CODE + ',PackageId:' + body["COMPANY_SALE_NO"] + ',Type:' + postOptions.path + ',Datetime:' + Date.now() + ',Message:' + optionData + '}');
                result = true; //  false;
            }
            else {
                console.log('KuaiQuCaiPush Success: { PackageId: ' + body["COMPANY_SALE_NO"] + ',Type:' + postOptions.path + ',Datetime:' + Date.now() + ',Message:' + optionData + '}');
                result = true;
            }
        }

        return result;

    } catch (error) {

        logger.error(error);
        throw error;
    }
}
