import http from 'http';

// nodejs的http是使用异步方式调用接口，通过此方法可以实现同步调用）

export function HttpRequest_GET(options: any) {

    let data = '';
    return new Promise(function (resolve, reject) {
        let req = http.request(options, function (res) {
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

export function HttpRequest_POST(options: any, writeData: any) {

    let data = '';
    return new Promise(function (resolve, reject) {
        let req = http.request(options, function (res) {
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
