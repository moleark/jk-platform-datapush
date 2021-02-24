"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZcygovPullWrite = void 0;
const uq_joint_1 = require("uq-joint");
const HttpRequestHelper_1 = require("../../tools/HttpRequestHelper");
let md5 = require('md5');
const config_1 = __importDefault(require("config"));
// import { isNullOrUndefined } from "util";
const stringUtils_1 = require("../../tools/stringUtils");
const globalVar_1 = require("../../tools/globalVar");
let StringtoUTF8_1 = require("../../tools/StringtoUTF8");
let HMACSHA256_1 = require("../../tools/HMACSHA256");
let urlencode = require('urlencode');
let fs = require('fs');
const zcygovApiSetting = config_1.default.get("zcygovApi");
async function ZcygovPullWrite(joint, uqIn, data) {
    let { key, mapper, uq: uqFullName, entity: tuid } = uqIn;
    if (key === undefined)
        throw 'key is not defined';
    if (uqFullName === undefined)
        throw 'tuid ' + tuid + ' not defined';
    let mapToUq = new uq_joint_1.MapUserToUq(joint);
    let body = await mapToUq.map(data, mapper);
    let result = false;
    let { appKey, appSecret, hostname, getCategory, CreateProduct, UpdateProduct, getDetail } = zcygovApiSetting;
    let { JKID, PackageId, CasFormat, OriginalId, BrandName, CatalogPrice, SalePrice, Storage, Description, DescriptionC, Package, IsDelete, StateName, Purity, Templatetypeid, MF, MW, MDL, Store, Delivetime, CategoryId } = body;
    //循环数据源
    // newFunction(JKID, body);
    // if (GlobalVar.list1.length == 2621) {
    //     console.log('写入txt文件');
    //     storeData(GlobalVar.list1, 'list1.json')
    //     storeData(GlobalVar.list2, 'list2.json')
    // }
    try {
        let list1 = JSON.parse(loadData('list1.json'));
        let list2 = JSON.parse(loadData('list2.json'));
        if (list1.length == 2621) {
            console.log('开始推送');
            for (let index = 0; index < list2.length; index++) {
                let arr = list1.filter((o) => o.id == list2[index]); //找到包装
                let imagearr = GetImage(arr[0].text.BrandName); //图片
                let obj = Getorigin(arr[0].text.BrandName); //产地 厂商
                let name = `${arr[0].text.BrandName} ${arr[0].text.OriginalId} ${stringUtils_1.StringUtils.isEmpty(arr[0].text.DescriptionC) ? arr[0].text.Description : arr[0].text.DescriptionC} ${arr[0].text.Purity == 'N/A' ? '' : arr[0].text.Purity} ${arr[0].text.CasFormat}`;
                var re = /最大|绝对|最低|第一/gi;
                name = name.replace(re, function (sMatch) {
                    return sMatch.replace(/./g, "");
                });
                let name_1 = name.substring(0, 200);
                //定义参数
                let CreateBody = {
                    "otherAttributes": [
                        {
                            "attrVal": arr[0].text.BrandName,
                            "attrKey": "品牌",
                            "propertyId": 82541
                        },
                        {
                            "attrVal": arr[0].text.OriginalId,
                            "attrKey": "型号",
                            "propertyId": 82542
                        },
                        {
                            "attrVal": obj['生产厂商'],
                            "attrKey": "生产厂商",
                            "propertyId": 82546
                        },
                        {
                            "attrVal": '件',
                            "attrKey": "计量单位",
                            "propertyId": 82544
                        }
                    ],
                    "layer": 11,
                    "skus": [],
                    "skuAttributes": [],
                    "item": {
                        "limit": obj['limit'],
                        "selfPlatformLink": "https://www.jkchemical.com/CH/Index.html",
                        "itemCode": arr[0].text.JKID,
                        "mainImage": imagearr[0],
                        "origin": obj['origin'],
                        "countryId": obj['countryId'],
                        "provinceId": "",
                        "cityId": "",
                        "regionId": "",
                        "name": name_1,
                        "categoryId": arr[0].text.CategoryId
                    },
                    "itemDetail": {
                        "detail": `  
                                    <p style="margin-left:80px;margin-bottom:15px;">【中文名称】：${name}</p>
                                    <p style="margin-left:80px;margin-bottom:15px;">【英文名称】：${arr[0].text.Description}</p>
                                    <p style="margin-left:80px;margin-bottom:15px;">【CAS】：${arr[0].text.CasFormat}</p>
                                    <p style="margin-left:80px;margin-bottom:15px;">【纯度】：${arr[0].text.Purity}</p>
                                    <p style="margin-left:80px;margin-bottom:15px;">【MF】：${arr[0].text.MF}</p>
                                    <p style="margin-left:80px;margin-bottom:15px;">【MW】：${arr[0].text.MW}</p>
                                    <p style="margin-left:80px;margin-bottom:15px;">【MDL】：${arr[0].text.MDL}</p>
                                    <p style="margin-left:80px;margin-bottom:15px;">【储藏条件】：${arr[0].text.Store}</p>
                                    `,
                        "images": imagearr
                    }
                };
                //"name": "J&K 100008 (六氟-2,4-戊烷二酮)铜(II) 14781-45-4 95% ",   
                for (let ar of arr) {
                    //开始循环包装 拼接参数
                    let skuAttr1 = {
                        "attrVal": ar.text.Package,
                        "attrKey": "规格"
                    };
                    let skuAttr2 = {
                        "attrVal": ar.text.Storage > 0 ? '1-3天' : '4-6周',
                        "attrKey": "货期"
                    };
                    CreateBody.skuAttributes.push(skuAttr1);
                    CreateBody.skuAttributes.push(skuAttr2);
                    let sku1 = {
                        "price": Math.round(ar.text.SalePrice) * 100,
                        "attrs": {
                            "货期": ar.text.Storage > 0 ? '1-3天' : '4-6周',
                            "规格": ar.text.Package
                        },
                        "platformPrice": ar.text.CatalogPrice * 100,
                        "quantity": GetStockamount(ar.text.BrandName),
                        "skuCode": ar.text.PackageId
                    };
                    CreateBody.skus.push(sku1);
                }
                //调取上传接口
                let CreateBodyMap = { "_data_": JSON.stringify(CreateBody) };
                let CreateProductResult = await zcygovHTTP(hostname, CreateProduct, appKey, appSecret, CreateBodyMap); //调取新增接口
                let CreateResult = JSON.parse(String(CreateProductResult));
                if (CreateResult.success == true) {
                    console.log(globalVar_1.GlobalVar.count + '、 ' + CreateProductResult);
                }
                else {
                    console.log(globalVar_1.GlobalVar.count + '、 ' + CreateProductResult);
                    let err = globalVar_1.GlobalVar.count + '、 ' + CreateProductResult + '\n' + 'CreateBodyMap：' + JSON.stringify(CreateBody) + '\n';
                    WriteError(err, 'zcygoypushError.txt');
                }
                globalVar_1.GlobalVar.count++;
            }
        }
        result = true;
        return result;
    }
    catch (error) {
        throw error;
    }
}
exports.ZcygovPullWrite = ZcygovPullWrite;
const loadData = (path) => {
    try {
        return fs.readFileSync(path, 'utf8');
    }
    catch (err) {
        console.error(err);
        return false;
    }
};
const storeData = (data, path) => {
    try {
        fs.writeFileSync(path, JSON.stringify(data));
    }
    catch (err) {
        console.error(err);
    }
};
const WriteError = (data, path) => {
    try {
        fs.appendFileSync(path, data);
    }
    catch (err) {
        console.error(err);
    }
};
function newFunction(JKID, body) {
    if (!globalVar_1.GlobalVar.list2.includes(JKID)) {
        globalVar_1.GlobalVar.list2.push(JKID);
    }
    let model = {
        id: JKID,
        text: body
    };
    globalVar_1.GlobalVar.list1.push(model);
    console.log('list1条数：' + globalVar_1.GlobalVar.list1.length);
    console.log('list2条数：' + globalVar_1.GlobalVar.list2.length);
}
function GetUnit(TemplateTypeId) {
    let ret = '';
    switch (TemplateTypeId) {
        case 1:
        case 2:
            ret = '瓶';
            break;
        case 3:
            ret = '件';
            break;
        default:
            throw "品牌产地，厂商解析错误";
    }
    return ret;
}
function Getorigin(BrandName) {
    let ret = {};
    switch (BrandName) {
        case "J&K":
        case "Amethyst":
        case "J&K Scientific":
            ret['origin'] = '河北省廊坊市大厂回族自治县';
            ret['生产厂商'] = '河北百灵威超精细材料有限公司';
            ret['limit'] = 0;
            ret['countryId'] = '';
            break;
        case "Strem":
            ret['origin'] = '';
            ret['生产厂商'] = 'Strem Chemicals, Inc';
            ret['limit'] = 1;
            ret['countryId'] = '228';
            break;
        case "AccuStandard":
            ret['origin'] = '';
            ret['生产厂商'] = 'AccuStandard, Inc.';
            ret['limit'] = 1;
            ret['countryId'] = '228';
            break;
        case "1-Material":
            ret['origin'] = '';
            ret['生产厂商'] = '1-Material Inc';
            ret['limit'] = 1;
            ret['countryId'] = '37';
            break;
        case "TCI":
            ret['origin'] = '';
            ret['生产厂商'] = '日本东京化成工业株式会社';
            ret['limit'] = 1;
            ret['countryId'] = '104';
            break;
        case "Wilmad":
            ret['origin'] = '';
            ret['生产厂商'] = 'Wilmad-labglass';
            ret['limit'] = 1;
            ret['countryId'] = '228';
            break;
        default:
            throw "品牌产地，厂商解析错误";
    }
    return ret;
}
//获取库存
function GetStockamount(amount) {
    let result = 10;
    if (amount > 0 && amount < 11) {
        result = 10;
    }
    else if (amount > 10 && amount < 21) {
        result = 20;
    }
    else if (amount > 20 && amount < 31) {
        result = 30;
    }
    else if (amount > 30 && amount < 40) {
        result = 40;
    }
    else if (amount > 40 && amount < 51) {
        result = 50;
    }
    else if (amount > 50 && amount < 61) {
        result = 60;
    }
    else if (amount > 60 && amount < 100) {
        result = 99;
    }
    else if (amount > 99) {
        result = 100;
    }
    return result;
}
//调取政采云接口封装
async function zcygovHTTP(hostname, path, appKey, appSecret, bodyMap) {
    let options = {
        hostname: hostname,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            'Accept': 'application/json',
            'X-Ca-Key': appKey,
            'X-Ca-Format': 'json2',
        }
    };
    //签名字段拼接
    let StringToSign = buildStringToSign(options.headers, options.method, options.path, bodyMap);
    //类型转换 成字节数组
    let appSecretKEY = StringtoUTF8_1.StringtoUTF8(appSecret);
    let stringToSign = StringtoUTF8_1.StringtoUTF8(StringToSign);
    //加密 生成签名
    let signature = HMACSHA256_1.HMACSHA256(stringToSign, appSecretKEY);
    //将签名加到Headers
    options.headers['X-Ca-Signature'] = signature;
    //body参数处理
    let writeData = '';
    let s1 = 0;
    for (let i in bodyMap) {
        if (s1 > 0) {
            writeData += "&" + i + "=" + urlencode(bodyMap[i]);
        }
        else {
            writeData += i + "=" + urlencode(bodyMap[i]);
        }
        s1++;
    }
    //调取请求
    let RequestResult = await HttpRequestHelper_1.HttpRequest_POST(options, writeData);
    return await RequestResult;
}
//获取图片
function GetImage(BrandName) {
    let result = [];
    switch (BrandName) {
        case "Wilmad":
            result = ['https://zcy-gov-item.oss-cn-north-2-gov-1.aliyuncs.com/3000529859/3bd5a6d6-ae7a-44fe-9cb0-e4d3ae92908c.jpg'];
            break;
        case "J&K Scientific":
            result = ['https://zcy-gov-item.oss-cn-north-2-gov-1.aliyuncs.com/3000529859/f88bcd7a-1b38-4718-a1fc-0cd7f458799f.jpg', 'https://zcy-gov-item.oss-cn-north-2-gov-1.aliyuncs.com/3000529859/8c67575c-7ae4-41cd-bb26-e702e14297fa.jpg', 'https://zcy-gov-item.oss-cn-north-2-gov-1.aliyuncs.com/3000529859/2364e1bc-b625-4cf3-a162-056b40a97874.jpg', 'https://zcy-gov-item.oss-cn-north-2-gov-1.aliyuncs.com/3000529859/06eb50d6-7857-43f9-b141-3bd4582e79ff.jpg', 'https://zcy-gov-item.oss-cn-north-2-gov-1.aliyuncs.com/3000529859/b3846fa5-3205-4aa2-b9a7-297d404928ba.jpg'];
            break;
        case "J&K":
            result = ['https://zcy-gov-item.oss-cn-north-2-gov-1.aliyuncs.com/3000529859/ebe3aedb-4aa9-4132-985d-2e8725954015.jpg'];
            break;
        case "Amethyst":
            result = ['https://zcy-gov-item.oss-cn-north-2-gov-1.aliyuncs.com/3000529859/84689fc9-ae7e-4c29-8b16-1b40e3d6880f.jpg'];
            break;
        case "TCI":
            result = ['https://zcy-gov-item.oss-cn-north-2-gov-1.aliyuncs.com/3000529859/9c9f1610-3cbf-4d25-a0dc-8cb1e26095cb.jpg'];
            break;
        case "AccuStandard":
            result = ['https://zcy-gov-item.oss-cn-north-2-gov-1.aliyuncs.com/3000529859/19a91358-6d0c-476f-a2ae-a3dc34ec5680.jpg'];
            break;
        case "Strem":
            result = ['https://zcy-gov-item.oss-cn-north-2-gov-1.aliyuncs.com/3000529859/1f2802be-2c0c-4fa6-b240-7056e1061c9e.jpg'];
            break;
        default:
            break;
    }
    return result;
}
//组装需要加密的签名
function buildStringToSign(header, method, path, bodyMap) {
    let sb = method + '\n';
    if (header.hasOwnProperty("Accept")) {
        sb += header["Accept"];
    }
    sb += '\n';
    if (header.hasOwnProperty("Content-MD5")) {
        sb += header["Content-MD5"];
    }
    sb += '\n';
    if (header.hasOwnProperty("Content-Type")) {
        sb += header["Content-Type"];
    }
    sb += '\n';
    if (header.hasOwnProperty("Date")) {
        sb += header["Date"];
    }
    sb += '\n';
    //生成 X-Ca-Signature-Headers 
    let result = buildHeaders(header);
    sb += result;
    //组装url
    let urlP = buildResource(path, bodyMap);
    sb += urlP;
    return sb;
}
//生成 X-Ca-Signature-Headers  
function buildHeaders(header) {
    //生成 X-Ca-Signature-Headers = signHeadersBuilder
    let signHeadersBuilder = '';
    let arr = "";
    for (let i in header) {
        if (i.indexOf("X-Ca-") == 0) {
            arr += i + ',';
            signHeadersBuilder += i + ",";
        }
    }
    signHeadersBuilder = signHeadersBuilder.substr(0, signHeadersBuilder.length - 1);
    header["X-Ca-Signature-Headers"] = signHeadersBuilder;
    //生成签名中的Headers
    let stringResult = arr.substr(0, arr.length - 1).split(',').sort();
    let signHeaders = "";
    stringResult.forEach(function (e) {
        signHeaders += e + ":" + header[e] + "\n";
    });
    return signHeaders;
}
//组装uri
function buildResource(uri, param) {
    //拼接 GET参数
    let url1 = uri;
    if (uri.indexOf("?") != -1) {
        var path = url1.split('?')[0];
        var queryString = url1.split('?')[1];
        url1 = path;
        if (typeof param === "object") {
            if (Object.keys(param).length == 0) {
                param = {};
            }
        }
        if (queryString != null && queryString != "") {
            queryString.split('&').forEach(function (query) {
                var key = query.split('=')[0];
                var value = query.split('=')[1];
                if (!param.hasOwnProperty(key)) {
                    param[key] = value;
                }
            });
        }
    }
    //拼接POST参数
    var sb = '';
    sb += url1;
    const orderParam = {};
    if (typeof param === "object") {
        if (Object.keys(param).length > 0) {
            sb += "?";
            //参数Key按字典排序
            Object.keys(param).sort().forEach(function (key) {
                orderParam[key] = param[key];
            });
            let flag = 0;
            //排序之后进行拼接
            Object.keys(orderParam).forEach(function (key) {
                if (flag != 0) {
                    sb += '&';
                }
                flag++;
                if (orderParam[key] == null || orderParam[key] == "") {
                    sb += key;
                }
                else {
                    if (Array.isArray(orderParam[key])) {
                        if (orderParam[key].length == 0) {
                            sb += key;
                        }
                        else {
                            sb += key + "=" + orderParam[key][0];
                        }
                    }
                    else {
                        sb += key + "=" + orderParam[key];
                    }
                }
            });
        }
    }
    return sb;
}
//# sourceMappingURL=zcygoypullwritefirst.js.map