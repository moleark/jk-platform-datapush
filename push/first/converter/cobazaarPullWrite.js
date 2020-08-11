"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uq_joint_1 = require("uq-joint");
let md5 = require('md5');
async function CobazaarPullWrite(joint, uqIn, data) {
    let { key, mapper, uq: uqFullName, entity: tuid } = uqIn;
    if (key === undefined)
        throw 'key is not defined';
    if (uqFullName === undefined)
        throw 'tuid ' + tuid + ' not defined';
    let keyVal = data[key];
    //let mapToUq = new MapToUq(this);
    let mapToUq = new uq_joint_1.MapUserToUq(joint);
    let body = await mapToUq.map(data, mapper);
    let { 品牌, 货号, 包装规格, 产品分类, 中文名称, 英文名称, 目录价, CAS, 交货期, 纯度, 保存条件, MDL, typeId, stateName, isDelete } = body;
    let result = false;
    return result;
}
exports.CobazaarPullWrite = CobazaarPullWrite;
//# sourceMappingURL=cobazaarPullWrite.js.map