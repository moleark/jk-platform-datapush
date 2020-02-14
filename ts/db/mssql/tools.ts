import * as mssql from 'mssql';
import { conn } from "./connection";
//import { init } from 'uq-joint/db/mysql/initDb';

let __pool: mssql.ConnectionPool;

export async function initMssqlPool() {
    __pool = await new mssql.ConnectionPool(conn).connect();
}

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

export async function execSql(sql: string, params?: { name: string, value: any }[]): Promise<any> {

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
    } catch (error) {
        // debugger;
        console.error(error + ":" + sql);
        if (error.code === 'ETIMEOUT')
            await execSql(sql, params);
        else
            throw error;
    }
};