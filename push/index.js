"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bodyParser = __importStar(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("config"));
//import { host, Joint } from 'uq-joint';
const index_1 = require("./uq-joint/index");
const index_2 = require("./settings/index");
const tools_1 = require("./db/mssql/tools");
(async function () {
    console.log(process.env.NODE_ENV);
    //await host.start();
    let connection = config_1.default.get("mysqlConn");
    if (connection === undefined || connection.host === '0.0.0.0') {
        console.log("mysql connection must defined in config/default.json or config/production.json");
        return;
    }
    await tools_1.initMssqlPool();
    let app = express_1.default();
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
    //res.header()设置响应头
    app.all("*", function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Methods", "POST,GET");
        res.header("Content-Type", "application/json;charset=utf-8");
        next();
    });
    // 使用 body-parser 
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(cors_1.default());
    app.set('json replacer', (key, value) => {
        if (value === null)
            return undefined;
        return value;
    });
    app.use(async (req, res, next) => {
        //调试信息
        let s = req.socket;
        let p = '';
        //if (req.method !== 'GET') p = JSON.stringify(req.body);
        //console.log('%s:%s - %s %s %s', s.remoteAddress, s.remotePort, req.method, req.originalUrl, p);
        try {
            await next();
        }
        catch (e) {
            console.error(e);
        }
    });
    // 监听服务
    let joint = new index_1.Joint(index_2.settings);
    let port = config_1.default.get('port');
    app.listen(port, async () => {
        console.log('jk-platform-datapush listening on port ' + port);
        joint.start();
    });
})();
//# sourceMappingURL=index.js.map