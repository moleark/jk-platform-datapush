"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicineStonePullWrite = void 0;
const uq_joint_1 = require("uq-joint");
const config_1 = __importDefault(require("config"));
const logger_1 = require("../../tools/logger");
const fetchRequest_1 = require("../../tools/fetchRequest");
const date_fns_1 = require("date-fns");
const https_1 = __importDefault(require("https"));
const medicineStoneSetting = config_1.default.get("medicineStoneApi");
/**
 * 南京药石
 * @param joint
 * @param uqIn
 * @param data
 * @returns
 */
async function medicineStonePullWrite(joint, uqIn, data) {
    let { key, mapper, uq: uqFullName, entity: tuid } = uqIn;
    if (key === undefined)
        throw 'key is not defined';
    if (uqFullName === undefined)
        throw 'tuid ' + tuid + ' not defined';
    let keyVal = data[key];
    let mapToUq = new uq_joint_1.MapUserToUq(joint);
    let body = await mapToUq.map(data, mapper);
    let { key: medicineStoneKey, secret, url } = medicineStoneSetting;
    let { brandName, originalId, mdl, casFormat, descriptionC, description, mf, mw, purity, deliverycycle, stateName, package: packageSize, catalogPrice, salePrice, stockamount, templateTypeId, productId } = body;
    try {
        let data = new Date();
        var hour = data.getHours();
        if (hour > 17 || hour < 8) {
            throw `key: ${keyVal} - 南京药石数据重发,上传时间改为早上8点到晚上18点 `;
        }
        let quantity = getStockamount(brandName, stockamount);
        let bodydata = {
            Products: [{
                    Brand: brandName,
                    CatalogNum: originalId,
                    MDL: mdl,
                    CAS: casFormat,
                    EnglishName: description,
                    ChineseName: descriptionC,
                    MolFormula: mf,
                    MolWeight: mw,
                    Purity: purity,
                    ShippingDays: "1-3天",
                    Status: stateName,
                    Inventorys: [],
                    Packages: [{
                            PackSize: packageSize,
                            LeadTime: GetDelivetime(brandName, deliverycycle),
                            Status: stateName,
                            Prices: [{
                                    ListPrice: catalogPrice.toFixed(2),
                                    DiscountPrice: salePrice.toFixed(2),
                                    Currency: "RMB",
                                    Status: stateName
                                }],
                            Inventorys: [{
                                    Quantity: quantity,
                                    Status: quantity > 0 ? "INSTOCK" : "OUTSTOCK",
                                    Location: ""
                                }]
                        }]
                }]
        };
        let json_data = JSON.stringify(bodydata);
        let fetchOptions = {
            url: url,
            options: {
                method: "POST",
                body: json_data,
                agent: new https_1.default.Agent({ rejectUnauthorized: false }),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Basic " + encodeBase64(medicineStoneKey + ":" + secret)
                }
            }
        };
        let ret = await fetchRequest_1.fetchRequest(fetchOptions);
        if (ret.code != "200") {
            throw 'medicineStone Fail: { Id: ' + keyVal + ',Type:' + stateName + ',Datetime:' + date_fns_1.format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message: ' + ret.msg + "}";
        }
        console.log('medicineStone Success: { Id: ' + keyVal + ',Type:' + stateName + ',Datetime:' + date_fns_1.format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message: ' + ret.msg + "}");
        return true;
    }
    catch (error) {
        logger_1.logger.error(error);
        throw error;
    }
}
exports.medicineStonePullWrite = medicineStonePullWrite;
/**
 * encodeBase64
 * @param source
 * @returns
 */
function encodeBase64(source) {
    return Buffer.from(source).toString('base64');
}
/**
 * 指定包装没有库存时的定制周期
 * @param brandName
 * @param deliveryCycle
 * @returns
 */
function GetDelivetime(brandName, deliveryCycle) {
    let result = '期货';
    if (brandName == 'Acros') {
        result = '2-5个工作日';
    }
    else if (brandName == 'TCI') {
        result = '2-5个工作日';
    }
    else if (brandName == 'Alfa') {
        result = '2-5个工作日';
    }
    else if (brandName == 'Alfa Aesar') {
        result = '2-5个工作日';
    }
    else {
        result = deliveryCycle;
    }
    return result;
}
/**
 * 库存范围
 * @param brandName
 * @param amount
 * @returns
 */
function getStockamount(brandName, amount) {
    let result = 0;
    if (amount > 0 && amount < 11) {
        result = 10;
    }
    else if (amount > 10 && amount < 21) {
        result = 20;
    }
    else if (amount > 20 && amount < 31) {
        result = 30;
    }
    else if (amount > 30 && amount < 41) {
        result = 40;
    }
    else if (amount > 40 && amount < 51) {
        result = 50;
    }
    else if (amount > 50 && amount < 61) {
        result = 60;
    }
    else if (amount > 60 && amount < 100) {
        result = 99;
    }
    else if (amount > 99) {
        result = 100;
    }
    return result;
}
//# sourceMappingURL=medicineStoneWrite.js.map