"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//接口测试代码
var http = require('http');
var md5 = require('md5');
const date_fns_1 = require("date-fns");
var data = {
    a: 123,
    time: new Date().getTime()
};
let addData = {
    rid: 'A0191067831_5_G',
    code: '9106783',
    cateid: 516,
    brandid: 300150934,
    typeid: 5,
    name: '2-Benzhydryl-4,6-di-tert-butylphenol, 99%',
    subname: '2-二苯甲基-4,6-叔丁基苯酚',
    mktprice: 1250,
    price: 875,
    unit: '瓶',
    imgs: [],
    stockamount: 0,
    isinsale: 1,
    intro: '99%',
    spec: '5G',
    maker: encodeURIComponent('J&K'),
    packinglist: '',
    service: '',
    deliverycycle: '4-6周',
    cascode: '796971-45-4',
    extends: [{ "key": 9, "value": '99%' }, { "key": 10, "value": '796971-45-4' }, { "key": 11, "value": 'C27H32O' }],
    groups: [3363],
    instructions: []
};
let upData2 = {
    rid: 'J200010001_250_MG',
    name: '2-乙酰氨基-4-氟苯甲酸2',
    subname: '2-Acetamido-4-fluorobenzoic acid2',
    mktprice: '374',
    price: '319',
    stockamount: 2,
    isinsale: 1,
    intro: '',
    instructions: [],
    imgs: []
};
let upData = {
    rid: 'J200010001_250_MG',
    //price: 300.2,
    isinsale: 0
};
//这是需要提交的数据
////var content = querystring.stringify(data);
//测试环境
/*
let appid = '507';
let secret = '2U75AuyZQAUHSXNdbSgkEUVdmz6oPwqD';
let dateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
*/
//生产环境
let appid = '448';
let secret = '8n51q8VWJJKfVfgCOdlhKFASXdir5vFV';
let dateTime = date_fns_1.format(new Date(), 'yyyy-MM-dd HH:mm:ss');
//获取商品类型 
/*
//签名验证，转换为大写进行判断
let md5Str = md5(appid + dateTime + secret);
let getProductType = '/v2/rest/Supplier/GetProductType?appid=' + appid + '&t=' + dateTime + '&sign=' + md5Str;

let path = encodeURI(getProductType);
console.log(path);
console.log(encodeURI(path));

var options = {
    //host: 'preapi.casmart.com.cn',
    host: 'api.casmart.com.cn',
    //port: 443,
    path: path,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
};
*/
//获取商品类型扩展属性
/*
//签名验证，转换为大写进行判断
let tid = 7;
let md5Str = md5(appid + dateTime + tid + secret);
let GetProductTypeExtend = '/v2/rest/Supplier/GetProductTypeExtend?appid=' + appid + '&tid=' + tid + '&t=' + dateTime + '&sign=' + md5Str;//学试剂（包括危化品）

let path = encodeURI(GetProductTypeExtend.trim());
console.log(path);

var options = {
    //host: 'preapi.casmart.com.cn',
    host: 'api.casmart.com.cn',
    path: path,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
};
*/
//获取品牌
/*
//签名验证，转换为大写进行判断
let md5Str = md5(appid + dateTime + secret);
let GetProductBrand = '/v2/rest/Supplier/GetProductBrand?appid=' + appid + '&t=' + dateTime + '&sign=' + md5Str;

let path = encodeURI(GetProductBrand);
console.log(path);

var options = {
    //host: 'preapi.casmart.com.cn',
    host: 'api.casmart.com.cn',
    //port: 443,
    path: path,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
};
*/
//获取分类
/*
//签名验证，转换为大写进行判断
let md5Str = md5(appid + dateTime + secret);
let GetProductCategory = '/v2/rest/Supplier/GetProductCategory?appid=' + appid + '&t=' + dateTime + '&sign=' + md5Str;

let path = encodeURI(GetProductCategory);
console.log(path);

var options = {
    //host: 'preapi.casmart.com.cn',
    host: 'api.casmart.com.cn',
    //port: 443,
    path: path,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
};
*/
//获取分组
/*
//签名验证，转换为大写进行判断
let md5Str = md5(appid + dateTime + secret);
let GetProductGroup = '/v2/rest/Supplier/GetProductGroup?appid=' + appid + '&t=' + dateTime + '&sign=' + md5Str;

let path = encodeURI(GetProductGroup);
console.log(path);

var options = {
    //host: 'preapi.casmart.com.cn',
    host: 'api.casmart.com.cn',
    //port: 443,
    path: path,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
};
*/
//添加产品
//签名验证，转换为大写进行判断
let jsonData = JSON.stringify(addData);
console.log(jsonData);
let md5Str = md5(appid + jsonData + dateTime + secret);
console.log(md5Str);
let AddProduct = '/v2/rest/Supplier/AddProduct?appid=' + appid + '&data=' + jsonData + '&t=' + dateTime + '&sign=' + md5Str;
console.log(AddProduct);
let path = encodeURI(AddProduct);
//let path = AddProduct;
console.log(path);
var options = {
    //host: 'preapi.casmart.com.cn',
    host: 'api.casmart.com.cn',
    //port: 443,
    path: path,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
};
//修改产品
/*
//签名验证，转换为大写进行判断
let jsonData = JSON.stringify(upData2);
let md5Str = md5(appid + jsonData + dateTime + secret);
let UpdateProduct = '/v2/rest/Supplier/UpdateProduct?appid=' + appid + '&data=' + jsonData + '&t=' + dateTime + '&sign=' + md5Str;

let path = encodeURI(UpdateProduct);
console.log(JSON.stringify(upData));
console.log(path);

var options = {
    //host: 'preapi.casmart.com.cn',
    host: 'api.casmart.com.cn',
    //port: 443,
    path: path,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json;'
    }
};
*/
var req = http.request(options, function (res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
    });
});
req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
});
//req.write(upData2);
req.end();
//# sourceMappingURL=kasima_Test.js.map