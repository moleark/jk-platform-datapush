"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZcygovPullWrite = void 0;
const uq_joint_1 = require("uq-joint");
const date_fns_1 = require("date-fns");
let md5 = require('md5');
const config_1 = __importDefault(require("config"));
const zcygovApiSetting = config_1.default.get("zcygovApi");
async function ZcygovPullWrite(joint, uqIn, data) {
    let { key, mapper, uq: uqFullName, entity: tuid } = uqIn;
    if (key === undefined)
        throw 'key is not defined';
    if (uqFullName === undefined)
        throw 'tuid ' + tuid + ' not defined';
    let keyVal = data[key];
    let mapToUq = new uq_joint_1.MapUserToUq(joint);
    let body = await mapToUq.map(data, mapper);
    let result = false;
    try {
        let { appKey, appSecret, hostname, getCategory, getCategoryAttr, getSpu, getBrand } = zcygovApiSetting;
        let { PackageId, CasFormat, OriginalId, BrandName, Description, DescriptionC, IsDelete, StateName, Purity, Templatetypeid, Packnr, Quantity, Unit, CatalogPrice, Discount, Storage, Delivetime } = body;
        let datetime = Date.now();
        let timestamp = date_fns_1.format(datetime, 'yyyy-MM-dd HH:mm:ss');
        //let postData = {};
        let options = {
            hostname: hostname,
            path: '',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8;'
            }
        };
        result = true;
    }
    catch (error) {
    }
    return result;
}
exports.ZcygovPullWrite = ZcygovPullWrite;
//# sourceMappingURL=zcygovPullWrite.js.map