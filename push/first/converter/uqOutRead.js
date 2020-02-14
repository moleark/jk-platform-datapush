"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("../../db/mssql/tools");
async function uqOutRead(sql, maxId) {
    // let iMaxId = maxId === "" ? 0 : Number(maxId);
    return await readMany(sql, [{ name: 'iMaxId', value: maxId }]);
}
exports.uqOutRead = uqOutRead;
async function uqPullRead(sql, queue) {
    let ret = await readOne(sql, [{ name: 'iMaxId', value: queue }]);
    if (ret !== undefined)
        return { queue: Number(ret.lastId), data: ret.data };
}
exports.uqPullRead = uqPullRead;
const readOne = async (sqlstring, params) => {
    let result = await tools_1.execSql(sqlstring, params);
    let { recordset } = result;
    if (recordset.length === 0)
        return;
    let prod = recordset[0];
    return { lastId: prod.ID, data: prod };
};
/**
 *
 * @param sqlstring 要执行的存储过程
 * @param params
 * @returns 对象: lastId: 多个结果中最大的id值；data: 是个对象的数组，数组中的对象属性即字段名，值即字段值
 */
async function readMany(sqlstring, params) {
    let result = await tools_1.execSql(sqlstring, params);
    let { recordset } = result;
    let rows = recordset.length;
    if (rows === 0)
        return;
    return { lastPointer: recordset[rows - 1].ID, data: recordset };
}
exports.readMany = readMany;
//# sourceMappingURL=uqOutRead.js.map