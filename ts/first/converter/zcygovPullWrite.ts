import { Joint, UqInTuid, UqIn, Tuid, MapUserToUq } from "uq-joint";
// import { Joint, UqInTuid, UqIn, Tuid } from "../../uq-joint";
import _ from 'lodash';
import { format, isSameWeek } from 'date-fns';
import { HttpRequest_GET, HttpRequest_POST } from '../../tools/HttpRequestHelper'
let md5 = require('md5');
import config from 'config';
import { logger } from "../../tools/logger";
// import { isNullOrUndefined } from "util";
import { StringUtils } from "../../tools/stringUtils";

const zcygovApiSetting = config.get<any>("zcygovApi");

export async function ZcygovPullWrite(joint: Joint, uqIn: UqIn, data: any): Promise<boolean> {

    let { key, mapper, uq: uqFullName, entity: tuid } = uqIn as UqInTuid;
    if (key === undefined) throw 'key is not defined';
    if (uqFullName === undefined) throw 'tuid ' + tuid + ' not defined';
    let keyVal = data[key];
    let mapToUq = new MapUserToUq(joint);
    let body = await mapToUq.map(data, mapper);

    let result = false;

    try {
        let { appKey, appSecret, hostname, getCategory, getCategoryAttr, getSpu, getBrand } = zcygovApiSetting;
        let { PackageId, CasFormat, OriginalId, BrandName, Description, DescriptionC, IsDelete, StateName, Purity, Templatetypeid, Packnr, Quantity, Unit, CatalogPrice,
            Discount, Storage, Delivetime } = body;
        let datetime = Date.now();
        let timestamp = format(datetime, 'yyyy-MM-dd HH:mm:ss');

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
    } catch (error) {

    }

    return result;
}