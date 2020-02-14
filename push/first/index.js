"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
const settings_1 = require("../settings");
//import { Joint, DataPullResult } from 'uq-joint';
const uq_joint_1 = require("../uq-joint");
const pulls_1 = require("./pulls");
const uqOutRead_1 = require("./converter/uqOutRead");
const tools_1 = require("../db/mssql/tools");
const logger_1 = require("../tools/logger");
const maxRows = config_1.default.get("firstMaxRows");
const promiseSize = config_1.default.get("promiseSize");
const pullEntities = config_1.default.get("firstEntities");
(async function () {
    logger_1.logger.info(process.env.NODE_ENV);
    //await host.start();
    //centerApi.initBaseUrl(host.centerUrl);
    await tools_1.initMssqlPool();
    let joint = new uq_joint_1.Joint(settings_1.settings);
    await joint.init();
    logger_1.logger.info('start');
    let start = Date.now();
    let priorEnd = start;
    for (var i = 0; i < pullEntities.length; i++) {
        let { read, uqIn } = pulls_1.pulls[pullEntities[i]];
        if (!uqIn)
            break;
        let { entity, pullWrite, firstPullWrite } = uqIn;
        logger_1.logger.info(entity + " start at " + new Date());
        let readFunc;
        if (typeof (read) === 'string') {
            readFunc = async function (maxId) {
                return await uqOutRead_1.uqOutRead(read, maxId);
            };
        }
        else {
            readFunc = read;
        }
        let maxId = '', count = 0;
        let promises = [];
        for (;;) {
            let ret;
            try {
                ret = await readFunc(maxId);
            }
            catch (error) {
                logger_1.logger.error(error);
                throw error;
            }
            if (ret === undefined || count > maxRows)
                break;
            let { lastPointer, data: rows } = ret;
            rows.forEach(e => {
                if (firstPullWrite !== undefined) {
                    promises.push(firstPullWrite(joint, e));
                }
                else if (pullWrite !== undefined) {
                    promises.push(pullWrite(joint, e));
                }
                else {
                    promises.push(joint.uqIn(uqIn, e));
                }
                count++;
            });
            maxId = lastPointer;
            try {
                await pushToTonva(promises, start, priorEnd, count, lastPointer);
            }
            catch (error) {
                logger_1.logger.error(error);
                if (error.code === "ETIMEDOUT") {
                    await pushToTonva(promises, start, priorEnd, count, lastPointer);
                }
                else {
                    throw error;
                }
            }
        }
        try {
            await Promise.all(promises);
        }
        catch (error) {
            // debugger;
            logger_1.logger.error(error);
            throw error;
        }
        promises.splice(0);
        logger_1.logger.info(entity + " end   at " + new Date());
    }
    ;
    process.exit();
})();
async function pushToTonva(promises, start, priorEnd, count, lastPointer) {
    if (promises.length >= promiseSize) {
        let before = Date.now();
        await Promise.all(promises);
        promises.splice(0);
        let after = Date.now();
        let sum = Math.round((after - start) / 1000);
        let each = Math.round(after - priorEnd);
        let eachSubmit = Math.round(after - before);
        logger_1.logger.info('count = ' + count + ' each: ' + each + ' sum: ' + sum + ' eachSubmit: ' + eachSubmit + 'ms; lastId: ' + lastPointer);
        priorEnd = after;
    }
}
//# sourceMappingURL=index.js.map