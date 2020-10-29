"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execSql = exports.initMssqlPool = void 0;
const mssql = __importStar(require("mssql"));
const connection_1 = require("./connection");
//import { init } from 'uq-joint/db/mysql/initDb';
let __pool;
async function initMssqlPool() {
    __pool = await new mssql.ConnectionPool(connection_1.conn).connect();
}
exports.initMssqlPool = initMssqlPool;
/*
async function getPool() {
    if (__pool === undefined) {
        return __pool = await new mssql.ConnectionPool(conn).connect();
    }
    else {
        return __pool;
    }

}
*/
async function execSql(sql, params) {
    try {
        const request = __pool.request();
        if (params !== undefined) {
            for (let p of params) {
                let { name, value } = p;
                request.input(name, value);
            }
        }
        const result = await request.query(sql);
        return result;
    }
    catch (error) {
        // debugger;
        console.error(error + ":" + sql);
        if (error.code === 'ETIMEOUT')
            await execSql(sql, params);
        else
            throw error;
    }
}
exports.execSql = execSql;
;
//# sourceMappingURL=tools.js.map