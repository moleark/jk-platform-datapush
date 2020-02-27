import { Joint } from "uq-joint";
//import { Joint } from "../../uq-joint";
import _ from 'lodash';
import { format, isSameWeek } from 'date-fns';
import http from 'http';
let md5 = require('md5');
import config from 'config';
import { logger } from "../../tools/logger";
import { DateTimeOffset } from "mssql";
import { readMany } from "./uqOutRead";
import { isNullOrUndefined } from "util";

//快去采接口相关配置
const kuaiQuCaiApiSetting = config.get<any>("kuaiQuCaiApi");

// 获取不同的chemid，化学试剂传cas号码、生物试剂传文档中固定的分类、耗材产品传''  
function GETCHEM_ID(templatetypeid: string, casFormat: string) {

    let result = ''
    switch (templatetypeid) {
        case "1":
            result = casFormat;
            break;
        case "2":
            result = 'SWSJ-002'; //没有其他部门同事进行帮忙分类，咱取其中一条
            break;
        case "3":
            result = '';
            break;
    }
    return result;
}

//获取化学品名称,优先传中文其次传英文
function GETCOMPANY_CHEM_NAME(templatetypeid: string, productName: string, productNameChinese: string): string {

    let result = '';
    if (templatetypeid == '1') {
        if (isNullOrUndefined(productNameChinese) || productNameChinese == '') {
            result = productName;
        } else {
            result = productNameChinese;
        }
    }
    return result;
}

//获取生物试剂名称
function GETCOMPANY_BIO_NAME(templatetypeid: string, productName: string, productNameChinese: string): string {

    let result = '';
    if (templatetypeid == '2') {
        if (isNullOrUndefined(productNameChinese) || productNameChinese === '') {
            result = productName;
        } else {
            result = productNameChinese;
        }
    }
    return result;
}

//获取耗材产品名称
function GETCOMPANY_CL_NAME(templatetypeid: string, productName: string, productNameChinese: string): string {

    let result = '';
    if (templatetypeid == '3') {
        if (isNullOrUndefined(productNameChinese) || productNameChinese === '') {
            result = productName;
        } else {
            result = productNameChinese;
        }
    }
    return result;
}

//获取发货时间，根据文档中不同的天数返回固定id (部分耗材产品没有发货时间)
function GETDELIVERYTIME_ID(storage: string, deliveryTime: string): string {

    let result = '';
    if (Number(storage) > 0) {
        result = "01";  //跟舒经理核实，现货产品传最小时间单位
    } else {
        if (isNullOrUndefined(deliveryTime)) {
            result = '21';
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

//获取货期类型：0 现货, 1 期货(5个品牌是代理国产商品), 2 期货(代理进口商品);
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

//获取厂商商品描述，平台反馈无法识别的套包装 可以在此处体现
function GETSPEC_MARK(packnr: any, packageSize: any, unit: string): string {

    let result: string = "";
    if (Number(packnr) > 1) {
        result = packnr + "*" + packageSize + unit + " 套包装; ";
    } else {
        result = "";
    }
    return result;
}

//获取产品图片，仪器耗材（其它类型产品不传）现在统一为一张logo。逐步实现一个品牌一张照片然后一个产品一张照片；
function GetImg(templateTypeId: string): any {

    let result = [];
    if (templateTypeId == "3") {
        result = ['https://www.jkchemical.com/image/map-jk.gif'];
    }
    return result;
}

//获取规格单位（只有耗材产品会用到）
function GETSPEC_ID(templateTypeId: string, unit: string): string {

    let result = '';
    if (templateTypeId == '1' || templateTypeId == '2') {
        result = '瓶';
    } else {
        if (unit == "EA") {
            result = 'EA';
        } else if (unit == "台") {
            result = '台';
        } else if (unit == "支") {
            result = '支';
        } else if (unit == "PAK") {
            result = '包';
        } else if (unit == "PCS") {
            result = '个';
        } else if (unit == "PACK") {
            result = '包';
        } else if (unit == "个") {
            result = '个';
        } else if (unit == "盒") {
            result = '盒';
        } else if (unit == "套") {
            result = '套';
        } else if (unit == "箱") {
            result = '箱';
        } else if (unit == "对") {
            result = '对';
        }
        else {
            result = 'none';
        }
    }
    return result;
}

//获取品牌名称（平台上维护的品牌有些与我司数据库中名称有差异）
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

//对查询到的产品进行处理 
export async function KuaiQuCaiPullWrite(joint: Joint, data: any): Promise<boolean> {

    try {
        //定义变量
        //console.log(data);
        //console.log('快去采平台处理');
        let result = false;

        let { companyId, key, host, chemAddPath, chemDetailPath, chemUpdatePath, chemDeletePath,
            bioAddPath, bioDetailPath, bioUpdatePath, bioDeletePath, clAddPath, clDetailPath, clUpdatePath, clDeletePath } = kuaiQuCaiApiSetting;
        let DateTime: number = Date.now();
        let timestamp = parseFloat((DateTime / 1000).toFixed());

        let token = md5(timestamp + companyId + key);
        let postData = {};
        let getOptions = {
            host: host,
            path: '',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'TIMESTAMP': timestamp,
                'COMPANY': companyId,
                'TOKEN': token
            }
        };

        //调用平台查询产品详情接口判断产品是否存在，查询接口区分 化学品查询、生物试剂查询、耗材查询三个接口；
        switch (data["TemplateTypeId"]) {

            case "1":
                getOptions.path = chemDetailPath + '?COMPANY_SALE_NO=' + data["COMPANY_SALE_NO"];
                break;
            case "2":
                getOptions.path = bioDetailPath + '?COMPANY_SALE_NO=' + data["COMPANY_SALE_NO"];
                break;
            case "3":
                getOptions.path = clDetailPath + '?COMPANY_SALE_NO=' + data["COMPANY_SALE_NO"];
                break;
            default:
                break;
        }

        // 统一的产品 json 数据，部分数据需要判断处理，所以增加了几个判断方法。
        let CHEM_ID = GETCHEM_ID(data["TemplateTypeId"], data["CASFORMAT"]);    //获取ChemID,化学品传cas、生物试剂传参数固定的分类、耗材产品空着
        let COMPANY_CHEM_NAME = GETCOMPANY_CHEM_NAME(data["TemplateTypeId"], data["ProductName"], data["ProductNameChinese"]);  //获取化学实际产品名称 
        let COMPANY_BIO_NAME = GETCOMPANY_BIO_NAME(data["TemplateTypeId"], data["ProductName"], data["ProductNameChinese"]);    //获取生物试剂产品名称 
        let COMPANY_CL_NAME = GETCOMPANY_CL_NAME(data["TemplateTypeId"], data["ProductName"], data["ProductNameChinese"]);      //获取耗材产品名称 
        let DELIVERYTIME_ID = GETDELIVERYTIME_ID(data["Storage"], data["DeliveTime"]);      //获取送货时间
        let DELIVERY_TYPE_ID = GETDELIVERY_TYPE_ID(data["Storage"], data["BrandName"]);     //获取货期类型
        let SPEC_MARK = GETSPEC_MARK(data["Packnr"], data["Quantity"], data["Unit"]);       //规格描述
        let SPEC_ID = GETSPEC_ID(data["TemplateTypeId"], data["Unit"]);             //规格
        let BRAND_NAME = GetBrandName(data["BrandName"]);   //品牌名称
        let IMG = GetImg(data["TemplateTypeId"]);

        let addDataChem = {
            COMPANY_SALE_NO: data["COMPANY_SALE_NO"],
            CHEM_ID: CHEM_ID,
            COMPANY_CHEM_NAME: COMPANY_CHEM_NAME,
            COMPANY_BIO_NAME: COMPANY_BIO_NAME,
            COMPANY_CL_NAME: COMPANY_CL_NAME,
            PRICE: data["PRICE"],
            VALUMEUNIT_ID: data["VALUMEUNIT_ID"],
            VALUME: data["VALUME"],
            SPEC_ID: SPEC_ID,
            SPEC_MARK: SPEC_MARK,
            SALE_MARK: 1,
            PURITY: data["PURITY"],
            STOCK: data["STOCK"],
            SRC_COMPANY: BRAND_NAME,
            ARTICLE_NO: data["ARTICLE_NO"],
            DISCOUNT_RATE: data["DISCOUNT_RATE"],
            DELIVERYTIME_ID: DELIVERYTIME_ID,
            DELIVERY_TYPE_ID: DELIVERY_TYPE_ID,
            COMPANY_DESC: SPEC_MARK,
            SUPPLY_COMPANY_ID: '162',       //供应商ID
            SUPPLY_COMPANY: '百灵威',       //供应商
            SALE_COMPANY_NAME: '北京百灵威科技有限公司',    //供应商全称
            SALE_COMPANY_PHONE: '010-59309000',         //供应商电话
            BRAND_NAME: BRAND_NAME,
            POSTAGE: 12,
            NO_POSTAGE_NUM: 0,
            BIO_TYPE_ID: '',
            CL_TYPE_ID: '',
            PACKAGE_TYPE: '',
            IMG: IMG
        };
        postData = JSON.stringify({ "DATA": [addDataChem] });

        // 第一次请求，先查询平台是否存在此产品 
        var req = http.request(getOptions, function (res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (chunk) {

                //对查询产品结果的判断：
                //console.log('BODY: ' + chunk);
                if (res.statusCode != 200) {

                    logger.error('KuaiQuCaiPush Fail: {Code:' + res.statusCode + ',PackageId: ' + data["COMPANY_SALE_NO"] + ',Type:' + data["StateName"] + ',Datetime:' + timestamp + ',Message:' + chunk + '}');
                    result = false;
                } else {

                    let resultOblect = JSON.parse(chunk);
                    let postOptions = {
                        host: host,
                        path: '',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json;charset=UTF-8',
                            'TIMESTAMP': timestamp,
                            'COMPANY': companyId,
                            'TOKEN': token
                        }
                    };

                    if (resultOblect.MESSAGE != 'SUCCESS') {
                        //平台上查询不到，应该调用新增方法 
                        if (data["IsDelete"] != '1') {
                            //判断产品类型，调用不同的接口地址  
                            switch (data["TemplateTypeId"]) {
                                case "1":
                                    postOptions.path = chemAddPath; //化学试剂新增接口地址
                                    break;
                                case "2":
                                    postOptions.path = bioAddPath;  //生物试剂新增接口地址
                                    break;
                                case "3":
                                    postOptions.path = clAddPath;   //耗材新增接口地址
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                    else {

                        //能够查询到的情况，应该调用修改或者删除方法
                        //判断产品类型，调用不同的接口地址（化学试剂、生物试剂、仪器耗材对应的接口地址不一致）
                        if (data["IsDelete"] == '1') {

                            let deleteData = data["COMPANY_SALE_NO"];
                            postData = JSON.stringify({ COMPANY_SALE_NOS: deleteData });
                            //平台存在产品， 我司要删除的情况 
                            switch (data["TemplateTypeId"]) {
                                case "1":
                                    postOptions.path = chemAddPath; //化学试剂删除接口地址
                                    break;
                                case "2":
                                    postOptions.path = bioAddPath;  //生物试剂删除接口地址
                                    break;
                                case "3":
                                    postOptions.path = clAddPath;   //耗材删除接口地址
                                    break;
                                default:
                                    break;
                            }
                        } else {
                            //平台存在产品，我司要修改的情况                            
                            switch (data["TemplateTypeId"]) {
                                case "1":
                                    postOptions.path = chemUpdatePath;  //化学试剂修改接口地址
                                    break;
                                case "2":
                                    postOptions.path = bioUpdatePath;   //生物试剂修改接口地址
                                    break;
                                case "3":
                                    postOptions.path = clUpdatePath;    //耗材修改接口地址
                                    break;
                                default:
                                    break;
                            }
                        }
                    }

                    //开始推送数据 
                    var req = http.request(postOptions, function (res) {
                        //console.log('STATUS: ' + res.statusCode);
                        //console.log('HEADERS: ' + JSON.stringify(res.headers));

                        res.setEncoding('utf8');
                        res.on('data', function (chunk) {
                            //console.log('BODY: ' + chunk);

                            if (res.statusCode != 200) {
                                logger.error('KuaiQuCaiPush Fail: {Code:' + res.statusCode + ',PackageId: ' + data["COMPANY_SALE_NO"] + ',Type:' + data["StateName"] + ',Datetime:' + timestamp + ',Message:' + chunk + '}');
                            } else {
                                let resultOblect = JSON.parse(chunk);
                                if (Number(resultOblect.DATA.SUCCESS_NUM) < 1) {

                                    // 此情况说明接口认证没有问题，但是可能数据上不符合，所以返回 true， 记录错误信息 继续执行；
                                    logger.error('KuaiQuCaiPush Fail:{ Code:' + res.statusCode + ',PackageId:' + data["COMPANY_SALE_NO"] + ',Type:' + data["StateName"] + ',Datetime:' + timestamp + ',Message:' + chunk + '}');
                                    result = true; // false;
                                }
                                else {
                                    console.log('KuaiQuCaiPush Success: { PackageId: ' + data["COMPANY_SALE_NO"] + ',Type:' + data["StateName"] + ',Datetime:' + timestamp + ',Message:' + chunk + '}');
                                    result = true;
                                }
                            }

                        });
                    });

                    req.on('error', function (e) {
                        logger.error('KuaiQuCaiPush Error:{ Code:None, PackageId: ' + data["COMPANY_SALE_NO"] + ',Type: ' + data["StateName"] + ',Datetime:' + timestamp + ',Message:' + e.message + '}');
                        result = false;
                    });

                    req.write(postData);
                    req.end();
                }

            });
        });

        req.on('error', function (e) {
            console.log('problem with request: ' + e.message);
        });
        req.end();
        return result;

    } catch (error) {
        logger.error(error);
        throw error;
    }
}


