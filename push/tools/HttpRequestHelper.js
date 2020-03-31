"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
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
//# sourceMappingURL=HttpRequestHelper.js.map