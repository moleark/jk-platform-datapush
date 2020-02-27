import express, { Request, Response, NextFunction, Router } from 'express';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import config from 'config';
//import { host, Joint } from 'uq-joint';
import { host, Joint } from './uq-joint/index';
import { settings } from './settings/index';
import { initMssqlPool } from './db/mssql/tools';

(async function () {

    console.log(process.env.NODE_ENV);
    //await host.start();

    let connection = config.get<any>("mysqlConn");
    if (connection === undefined || connection.host === '0.0.0.0') {
        console.log("mysql connection must defined in config/default.json or config/production.json");
        return;
    }
    await initMssqlPool();
    let app = express();

    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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
    app.use(cors());
    app.set('json replacer', (key: string, value: any) => {
        if (value === null) return undefined;
        return value;
    });

    app.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {

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
    let joint = new Joint(settings);
    let port = config.get<number>('port');
    app.listen(port, async () => {
        console.log('jk-platform-datapush listening on port ' + port);
        joint.start();
    });

})();
