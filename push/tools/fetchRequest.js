"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRequest = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const logger_1 = require("../tools/logger");
/**
 * HTTP Fetch请求
 * @param fetchOptions
 * @returns
 */
async function fetchRequest(fetchOptions) {
    let { url, options } = fetchOptions;
    try {
        let rep = await node_fetch_1.default(url, options);
        if (rep.ok) {
            return await rep.json();
        }
        else {
            throw `Fetch error: status: ${rep.status}  statusText :${rep.statusText}`;
        }
    }
    catch (error) {
        logger_1.logger.error(error);
        throw error;
    }
}
exports.fetchRequest = fetchRequest;
//# sourceMappingURL=fetchRequest.js.map