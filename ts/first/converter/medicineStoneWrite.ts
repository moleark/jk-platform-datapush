import { Joint, UqInTuid, UqIn, Tuid, MapUserToUq } from "uq-joint";
import config from 'config';
import { logger } from "../../tools/logger";
import { fetchRequest } from "../../tools/fetchRequest";
import { format } from "date-fns";
import https from 'https'

const medicineStoneSetting = config.get<any>("medicineStoneApi");


/**
 * 南京药石
 * @param joint 
 * @param uqIn 
 * @param data 
 * @returns 
 */
export async function medicineStonePullWrite(joint: Joint, uqIn: UqIn, data: any): Promise<boolean> {

    let { key, mapper, uq: uqFullName, entity: tuid } = uqIn as UqInTuid;
    if (key === undefined) throw 'key is not defined';
    if (uqFullName === undefined) throw 'tuid ' + tuid + ' not defined';
    let keyVal = data[key];
    let mapToUq = new MapUserToUq(joint);
    let body = await mapToUq.map(data, mapper);

    let { key: medicineStoneKey, secret, url } = medicineStoneSetting;
    let { brandName, originalId, mdl, casFormat, descriptionC, description, mf, mw, purity, deliverycycle, stateName,
        package: packageSize, catalogPrice, salePrice, stockamount, templateTypeId, productId } = body;

    try {

        let data = new Date();
        var hour = data.getHours();

        if (hour < 18 && hour > 7) {
            throw `key: ${keyVal} - 南京药石建议晚上上传,上传时间为晚上18点到早上8点 `;
        }

        let quantity = getStockamount(brandName, stockamount);

        let bodydata: any = {
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
        let fetchOptions: any = {
            url: url,
            options: {
                method: "POST",
                body: json_data,
                agent: new https.Agent({ rejectUnauthorized: false }),    // https 必须加上这一句, http 请求必须去掉
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Basic " + encodeBase64(medicineStoneKey + ":" + secret)
                }
            }
        };

        let ret = await fetchRequest(fetchOptions);
        if (ret.code != "200") {
            throw 'medicineStone Fail: { Id: ' + keyVal + ',Type:' + stateName + ',Datetime:' + format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message: ' + ret.msg + "}";
        }

        console.log('medicineStone Success: { Id: ' + keyVal + ',Type:' + stateName + ',Datetime:' + format(Date.now(), 'yyyy-MM-dd HH:mm:ss') + ',Message: ' + ret.msg + "}")
        return true;
    } catch (error) {
        logger.error(error);
        throw error;
    }
}


/**
 * encodeBase64
 * @param source 
 * @returns 
 */
function encodeBase64(source: string) {
    return Buffer.from(source).toString('base64');
}


/**
 * 指定包装没有库存时的定制周期
 * @param brandName 
 * @param deliveryCycle 
 * @returns 
 */
function GetDelivetime(brandName: string, deliveryCycle: string) {

    let result = '期货';

    if (brandName == 'Acros') {
        result = '2-5个工作日';
    } else if (brandName == 'TCI') {
        result = '2-5个工作日';
    } else if (brandName == 'Alfa') {
        result = '2-5个工作日';
    } else if (brandName == 'Alfa Aesar') {
        result = '2-5个工作日';
    } else {
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
function getStockamount(brandName: string, amount: number): number {
    let result = 0;
    if (amount > 0 && amount < 11) {
        result = 10;
    } else if (amount > 10 && amount < 21) {
        result = 20;
    } else if (amount > 20 && amount < 31) {
        result = 30;
    } else if (amount > 30 && amount < 41) {
        result = 40;
    } else if (amount > 40 && amount < 51) {
        result = 50;
    } else if (amount > 50 && amount < 61) {
        result = 60;
    } else if (amount > 60 && amount < 100) {
        result = 99;
    } else if (amount > 99) {
        result = 100;
    }
    return result;
}