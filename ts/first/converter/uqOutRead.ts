import { DataPullResult } from 'uq-joint';
import { execSql } from '../../db/mssql/tools';

export async function uqOutRead(sql: string, maxId: string | number): Promise<DataPullResult> {
    // let iMaxId = maxId === "" ? 0 : Number(maxId);
    return await readMany(sql, [{ name: 'iMaxId', value: maxId }]);
}

export async function uqPullRead(sql: string, queue: number): Promise<{ queue: number, data: any }> {
    let ret = await readOne(sql, [{ name: 'iMaxId', value: queue }]);
    if (ret !== undefined)
        return { queue: Number(ret.lastId), data: ret.data };
}

const readOne = async (sqlstring: string, params?: { name: string, value: any }[]): Promise<{ lastId: string, data: any }> => {

    let result = await execSql(sqlstring, params);
    let { recordset } = result;
    if (recordset.length === 0) return;
    let prod = recordset[0];
    return { lastId: prod.ID, data: prod };
};

/**
 *
 * @param sqlstring 要执行的存储过程
 * @param params
 * @returns 对象: lastId: 多个结果中最大的id值；data: 是个对象的数组，数组中的对象属性即字段名，值即字段值
 */
export async function readMany(sqlstring: string, params?: { name: string, value: any }[]): Promise<DataPullResult> {

    let result = await execSql(sqlstring, params);
    let { recordset } = result;
    let rows = recordset.length;
    if (rows === 0) return;

    return { lastPointer: recordset[rows - 1].ID, data: recordset };
}