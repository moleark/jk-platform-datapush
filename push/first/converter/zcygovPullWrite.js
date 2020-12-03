"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZcygovPullWrite = void 0;
//import { Joint, UqInTuid, UqIn, Tuid, MapUserToUq } from "uq-joint";
const uq_joint_1 = require("../../uq-joint");
const date_fns_1 = require("date-fns");
const HttpRequestHelper_1 = require("../../tools/HttpRequestHelper");
let md5 = require('md5');
const config_1 = __importDefault(require("config"));
let StringtoUTF8_1 = require("../../tools/StringtoUTF8");
let HMACSHA256_1 = require("../../tools/HMACSHA256");
let urlencode = require('urlencode');
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
    try {
        let { appKey, appSecret, hostname, getCategory, CreateProduct, UpdateProduct, getDetail } = zcygovApiSetting;
        let { PackageId, CasFormat, OriginalId, BrandName, Description, DescriptionC, IsDelete, StateName, Purity, Templatetypeid, Packnr, Quantity, Unit, CatalogPrice, Discount, Storage, Delivetime } = body;
        let datetime = Date.now();
        let timestamp = date_fns_1.format(datetime, 'yyyy-MM-dd HH:mm:ss');
        let DetailbodyMap = { "_data_": JSON.stringify({ itemCode: 'A01100008' }) };
        //商品详情 
        let DetailResult = await zcygovHTTP(hostname, getDetail, appKey, appSecret, DetailbodyMap);
        let Detail = JSON.parse(String(DetailResult));
        if (Detail.data_response == null) { //商品不存在 走新增接口
            if (Detail.error_response.resultCode == "-1" && Detail.error_response.resultMsg == "商品不存在") {
                let CreateBody = {
                    "otherAttributes": [
                        {
                            "attrVal": BrandName,
                            "attrKey": "品牌",
                            "propertyId": 82541
                        },
                        {
                            "attrVal": "100008",
                            "attrKey": "型号",
                            "propertyId": 82542
                        },
                        {
                            "attrVal": "百灵威科技",
                            "attrKey": "生产厂商",
                            "propertyId": 82546
                        }
                    ],
                    "layer": 11,
                    "skus": [
                        {
                            "price": 88888,
                            "attrs": {
                                "货期": "1周内",
                                "规格": "1G"
                            },
                            "platformPrice": 999999,
                            "quantity": 20000,
                            "skuCode": "A011000081_1_G"
                        }
                    ],
                    "skuAttributes": [
                        {
                            "attrVal": "1G",
                            "attrKey": "规格"
                        },
                        {
                            "attrVal": "1周内",
                            "attrKey": "货期"
                        }
                    ],
                    "item": {
                        "limit": 0,
                        "selfPlatformLink": "https://www.jkchemical.com/CH/Index.html",
                        "itemCode": "A01100008",
                        "mainImage": "https://zcy-gov-item.oss-cn-north-2-gov-1.aliyuncs.com/3000529859/ebe3aedb-4aa9-4132-985d-2e8725954015.jpg",
                        "origin": "河北省廊坊市大厂回族自治县",
                        "countryId": "1",
                        "provinceId": "130000",
                        "cityId": "131000",
                        "regionId": "131028",
                        "name": "（测试商品勿拍）J&K 100008 (六氟-2,4-戊烷二酮)铜(II) 14781-45-4 95% ",
                        "categoryId": 803800
                    },
                    "itemDetail": {
                        "detail": "测试商品TEST123456（勿拍）",
                        "images": [
                            "https://zcy-gov-item.oss-cn-north-2-gov-1.aliyuncs.com/3000529859/ebe3aedb-4aa9-4132-985d-2e8725954015.jpg"
                        ]
                    }
                };
                let CreateBodyMap = { "_data_": JSON.stringify(CreateBody) };
                let CreateProductResult = await zcygovHTTP(hostname, CreateProduct, appKey, appSecret, CreateBodyMap); //调取新增接口
                let CreateResult = JSON.parse(String(CreateProductResult));
                if (CreateResult.success == true) {
                    result = true;
                }
                else {
                    console.log(CreateResult.error_response);
                    result = false;
                }
            }
            else {
                //其他错误  console
                console.log(Detail.error_response);
                result = false;
            }
        }
        else { //走更新接口
            let UpdateBodyMap = {};
            let flag = true;
            //
            let body = Detail.data_response;
            body.skuAttributes.forEach((element) => {
                if (element.attrVal.includes("一周内")) {
                    flag = false;
                }
            });
            let CreateProductResult = await zcygovHTTP(hostname, UpdateProduct, appKey, appSecret, UpdateBodyMap);
        }
        result = true;
    }
    catch (error) {
        throw error;
    }
    return result;
}
exports.ZcygovPullWrite = ZcygovPullWrite;
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
    console.log('加密后的签名:' + signature);
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
    //打印参数
    console.log('打印writeData：' + writeData);
    for (var i in options) {
        console.log('打印options：key:' + i + '  value:' + options[i]);
    }
    console.log('打印options结束');
    //调取请求
    let RequestResult = await HttpRequestHelper_1.HttpRequest_POST(options, writeData);
    console.log(RequestResult);
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
        case "Accustandard":
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
                    console.log(Array.isArray([1, 2, 3]));
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
    console.log(orderParam);
    return sb;
}
//# sourceMappingURL=zcygovPullWrite.js.map