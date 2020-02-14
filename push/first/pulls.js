"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqls_1 = require("./converter/sqls");
const casmartPush_1 = require("../settings/in/casmartPush");
/** */
exports.pulls = {
    // 平台指令数据结果表
    "PlatformEntryResult": { read: sqls_1.sqls.readWarehouse, uqIn: casmartPush_1.CasmartPush },
};
//# sourceMappingURL=pulls.js.map