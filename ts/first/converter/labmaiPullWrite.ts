//import { Joint, UqInTuid, UqIn, Tuid, MapUserToUq } from "../../uq-joint";
import { Joint, UqInTuid, UqIn, Tuid, MapUserToUq } from "uq-joint";
import { format } from 'date-fns';
import config from 'config';
import { logger } from "../../tools/logger";
import { HttpRequest_method } from '../../tools/HttpRequestHelper';
import { StringUtils } from "../../tools/stringUtils";
import { GlobalVar } from '../../tools/globalVar';
import { matching } from '../../tools/matching';
let urlencode = require('urlencode');
let fs = require('fs');


/**
 * 基理接口相关配置
 */
const labmaiApiSetting = config.get<any>("labmaiApi");

/**
 * 推送数据
 * @param joint 
 * @param uqIn 
 * @param data 
 */
export async function LabmaiPullWrite(joint: Joint, uqIn: UqIn, data: any): Promise<boolean> {
    let { key, mapper, uq: uqFullName, entity: tuid } = uqIn as UqInTuid;
    if (key === undefined) throw 'key is not defined';
    if (uqFullName === undefined) throw 'tuid ' + tuid + ' not defined';
    let mapToUq = new MapUserToUq(joint);
    let body = await mapToUq.map(data, mapper);
    let keyVal = data[key];
    let { Client_id, Client_secret, hostname, gettokenPath, spuOpertion } = labmaiApiSetting;
    let { BrandName, CasFormat, OriginalId, CatalogPrice, SalePrice, DescriptionC, Description, Package, IsDelete, StateName, Purity, Templatetypeid,
        MF, MW, MDL, JKID, SeconClass, ThirdClass, COL, is_cylinder } = body;


    let result = false;
    try {
        // 判断有没有获取到token信息
        if (StringUtils.isEmpty(GlobalVar.access_token) || StringUtils.isEmpty(GlobalVar.expires_in) || StringUtils.isEmpty(GlobalVar.createtimestamp)) {
            await getTokenInfo(hostname, gettokenPath, Client_id, Client_secret);
        }

        // 判断获取到的token信息有没有过期（接口token有效时间60分钟，此处设置为超过55分钟则重新获取）
        let diffMinutes = GlobalVar.createtimestamp - Date.now();

        if (diffMinutes <= 300000) {
            await getTokenInfo(hostname, gettokenPath, Client_id, Client_secret);
        }
        let Options = {
            hostname: hostname,
            path: '',
            method: '',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + GlobalVar.access_token
            }
        };
        let writeData: any = {};


        if (StateName == 'delete') {//删除
            Options.method = 'DELETE';
            Options.path = spuOpertion + `/${urlencode(BrandName)}/${urlencode(OriginalId)}/${urlencode(Package)}`;

        }
        else {
            if (StateName == 'edit') {
                Options.method = 'PATCH';
                Options.path = spuOpertion + `/${urlencode(BrandName)}/${urlencode(OriginalId)}/${urlencode(Package)}`;
            }
            else {
                Options.method = 'POST';
                Options.path = spuOpertion + `/${urlencode(SeconClass)}`;
            }

            //根据商品的TYPE，还需要补全扩展字段，请参考 ⽣物试剂的扩展字段, 化学试剂的扩展字段

            writeData = {
                category: ThirdClass,
                name: `${DescriptionC} | ${Description}`,
                aliases: DescriptionC == null || "" ? Description : DescriptionC,
                brand_name: BrandName,
                catalog_no: OriginalId,
                package: Package,
                orig_price: SalePrice,
                description: `  
                            【中文名称】：${DescriptionC == null || "" ? Description : DescriptionC}
                            【英文名称】：${Description}
                            【CAS】：${CasFormat}
                            【纯度】：${Purity}
                            【MF】：${MF}
                            【MW】：${MW}
                            【MDL】：${MDL}
                            `
            };
            if (SeconClass == "chem_reagent") {     //化学试剂需要传的字段
                if (CasFormat == 0 || COL == null) {
                    console.log(`LabmaiPush Success:{ keyVal:${keyVal}, Type: ${StateName} ,DateTime: ${format(Date.now(), 'yyyy-MM-dd HH:mm:ss')} , Message: 化学试剂CAS号、COL 为必填字段，为空的直接跳过 }`);
                    return true;
                }
                let metric = await UnitConvert(Package, COL);
                writeData.cas_no = CasFormat,
                    writeData.is_cylinder = is_cylinder,
                    writeData.metric_value = metric.metric_value,
                    writeData.metric_unit = metric.metric_unit,
                    writeData.state = COL,
                    writeData.formula = MF == 'N/A' ? "" : MF,
                    writeData.molecular_weight = MW == 'N/A' ? "" : MW

            }
        }

        let HttpResult = await HttpRequest_method(Options, JSON.stringify(writeData));
        let resultData = JSON.parse(String(HttpResult));
        if (resultData.statusCode == 200) {
            result = true;
            console.log(`LabmaiPush Success:{ keyVal:${keyVal}, Type: ${StateName} ,DateTime: ${format(Date.now(), 'yyyy-MM-dd HH:mm:ss')} , Message: ${HttpResult} }`);
        }
        else {
            if (resultData.statusCode == 403 && resultData.statusMessage == 'Forbidden' && resultData.data.msg == '数据异常') {
                console.log(`LabmaiPush Fail:{  keyVal:${keyVal}, Type: ${StateName} ,DateTime: ${format(Date.now(), 'yyyy-MM-dd HH:mm:ss')} , Message: ${HttpResult} }`);
                if (resultData.data.error[0].indexOf('商品包装不合规') != -1 || resultData.data.error[0].indexOf('指定化学品CAS号') != -1) {

                    WriteError(` keyVal:${keyVal}, Message: ${HttpResult} }` + '\n', 'LabmaiPush-error.txt');
                    result = true;
                }


            }
            else if (StateName == "add" && resultData.statusCode == 403 && resultData.data.msg == 'SPU已存在') {

                Options.method = 'PATCH';
                Options.path = spuOpertion + `/${urlencode(BrandName)}/${urlencode(OriginalId)}/${urlencode(Package)}`;


                let HttpResult2 = await HttpRequest_method(Options, JSON.stringify(writeData));
                let resultData2 = JSON.parse(String(HttpResult2));
                if (resultData2.statusCode == 200) {
                    result = true;
                    console.log(`LabmaiPush Success:{  keyVal:${keyVal}, Type: ${StateName} 转 edit ,DateTime: ${format(Date.now(), 'yyyy-MM-dd HH:mm:ss')} , Message: ${HttpResult2} }`);
                }
                else {
                    throw (`LabmaiPush Fail:{  keyVal:${keyVal}, Type: ${StateName} 转 edit ,DateTime: ${format(Date.now(), 'yyyy-MM-dd HH:mm:ss')} , Message: ${HttpResult2} }`);
                }

            }
            else if (StateName == "edit" && resultData.statusCode == 404 && resultData.statusMessage == 'Not Found') {

                Options.method = 'POST';
                Options.path = spuOpertion + `/${urlencode(SeconClass)}`;

                let HttpResult2 = await HttpRequest_method(Options, JSON.stringify(writeData));
                let resultData2 = JSON.parse(String(HttpResult2));
                if (resultData2.statusCode == 200) {
                    result = true;
                    console.log(`LabmaiPush Success:{  keyVal:${keyVal}, Type: ${StateName} 转 add ,DateTime: ${format(Date.now(), 'yyyy-MM-dd HH:mm:ss')} , Message: ${HttpResult2} }`);
                }
                else {
                    throw (`LabmaiPush Fail:{  keyVal:${keyVal}, Type: ${StateName} 转 add  ,DateTime: ${format(Date.now(), 'yyyy-MM-dd HH:mm:ss')} , Message: ${HttpResult2} }`);
                }
            }
            else if (StateName == "delete" && resultData.statusCode == 404) {
                result = true;
                console.log(`LabmaiPush Success:{  keyVal:${keyVal}, Type: ${StateName} ,DateTime: ${format(Date.now(), 'yyyy-MM-dd HH:mm:ss')} , Message: ${HttpResult} }`);
            }
            else {
                throw (`LabmaiPush Fail:{  keyVal:${keyVal}, Type: ${StateName} ,DateTime: ${format(Date.now(), 'yyyy-MM-dd HH:mm:ss')} , Message: ${HttpResult} }`);
            }


        }
        return result;
    } catch (error) {
        logger.error(error);
        throw error;
    }
}

/**
 * 写入txt
 * @param data 
 * @param path 
 */
const WriteError = (data: string, path: string) => {
    try {
        fs.appendFileSync(path, data)
    } catch (err) {
        console.error(err)
    }
}
/**
 * 获取access_token信息
 * @param hostname 
 * @param gettokenPath 
 * @param Client_id 
 * @param Client_secret 
 */
async function getTokenInfo(hostname: string, gettokenPath: string, Client_id: string, Client_secret: string) {

    let requestData = {
        client_id: Client_id,
        client_secret: Client_secret
    };

    let options = {
        method: 'POST',
        hostname: hostname,
        path: gettokenPath,
        headers: {
            'Content-Type': 'application/json'
        },
    };
    let optionData = await HttpRequest_method(options, JSON.stringify(requestData));

    let postResult = JSON.parse(String(optionData));
    if (postResult.statusCode == 200) {
        let result = postResult.data.content;
        GlobalVar.access_token = result.access_token;
        GlobalVar.expires_in = result.expires_in;
        GlobalVar.createtimestamp = Number(Date.now()) + Number(result.expires_in * 1000);
    }
    else {
        console.log(String(optionData));
        throw ('获取token失败');
    }
}



/**
 * 包装单位转换
 * @param packages 
 */
const UnitConvert = async (packages: string, COL: string) => {

    let model: any = {};
    let radiox: number = 1;
    let radioy: any;
    let unit: string;
    // 判断识别套包装的情况
    let count = packages.indexOf('x');
    if (count > 0) {
        let packageArray = packages.split('x');
        radiox = Number(packageArray[0]);
        let packageSizeSplt = packageArray[1];
        radioy = await matching(packageSizeSplt, 'number');
        unit = await matching(packageSizeSplt, 'letter');
    } else {
        radioy = await matching(packages, 'number');
        unit = await matching(packages, 'letter');
    }

    switch (unit.toUpperCase()) {
        case 'G':
            model.metric_value = radiox * radioy;
            model.metric_unit = 'g';
            break;
        case 'KG':
            model.metric_value = radiox * radioy * 1000;
            model.metric_unit = 'g';
            break;
        case 'MG':
            model.metric_value = radiox * radioy / 1000;
            model.metric_unit = 'g';
            break;
        case 'UG':
            model.metric_value = radiox * radioy / 1000000;
            model.metric_unit = 'g';
            break;
        case 'L':
            model.metric_value = radiox * radioy * 1000;
            model.metric_unit = 'ml';
            break;
        case 'ML':
            model.metric_value = radiox * radioy;
            model.metric_unit = 'ml';
            break;
        case 'UL':
            model.metric_value = radiox * radioy / 1000;
            model.metric_unit = 'ml';
            break;

        default:
            if (COL == "固态") {
                model.metric_value = radiox * radioy;
                model.metric_unit = 'g';
            }
            else {
                model.metric_value = radiox * radioy;
                model.metric_unit = 'ml';
            }
            break;
    }
    return model;
}