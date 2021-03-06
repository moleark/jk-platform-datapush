"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpRequest_method = exports.HttpsRequest_POST = exports.HttpRequest_POST = exports.HttpsRequest_GET = exports.HttpRequest_GET = void 0;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
// nodejs的http是使用异步方式调用接口，通过此方法可以实现同步调用）
function HttpRequest_GET(options) {
    let data = '';
    return new Promise(function (resolve, reject) {
        let req = http_1.default.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                resolve(data);
            });
        });
        req.on('error', (e) => {
            throw '请求失败，请检查访问地址或网络连接:' + e;
        });
        req.end();
    });
}
exports.HttpRequest_GET = HttpRequest_GET;
function HttpsRequest_GET(options) {
    let data = '';
    return new Promise(function (resolve, reject) {
        let req = https_1.default.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                resolve(data);
            });
        });
        req.on('error', (e) => {
            throw '请求失败，请检查访问地址或网络连接:' + e;
        });
        req.end();
    });
}
exports.HttpsRequest_GET = HttpsRequest_GET;
function HttpRequest_POST(options, writeData) {
    let data = '';
    return new Promise(function (resolve, reject) {
        let req = http_1.default.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                resolve(data);
            });
        });
        req.on('error', (e) => {
            throw '请求失败，请检查访问地址或对方网络连接:' + e;
        });
        req.write(writeData);
        req.end();
    });
}
exports.HttpRequest_POST = HttpRequest_POST;
function HttpsRequest_POST(options, writeData) {
    let data = '';
    return new Promise(function (resolve, reject) {
        let req = https_1.default.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                resolve(data);
            });
        });
        req.on('error', (e) => {
            throw '请求失败，请检查访问地址或对方网络连接:' + e;
        });
        req.write(writeData);
        req.end();
    });
}
exports.HttpsRequest_POST = HttpsRequest_POST;
function HttpRequest_method(options, writeData) {
    let data = '';
    return new Promise(function (resolve, reject) {
        let req = http_1.default.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                let ResultData = `{\"statusCode\": ${res.statusCode},\"statusMessage\": "${res.statusMessage}",\"data\":${data == '' ? '""' : data}}`;
                resolve(ResultData);
            });
        });
        req.on('error', (e) => {
            throw '请求失败，请检查访问地址或对方网络连接:' + e;
        });
        req.write(writeData);
        req.end();
    });
}
exports.HttpRequest_method = HttpRequest_method;
//# sourceMappingURL=HttpRequestHelper.js.map