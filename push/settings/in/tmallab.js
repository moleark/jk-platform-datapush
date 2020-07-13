"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//import { UqInTuid } from "../../uq-joint";
const tmallabPullWrite_1 = require("../../first/converter/tmallabPullWrite");
const config_1 = __importDefault(require("config"));
const promiseSize = config_1.default.get("promiseSize");
let pullSql = ` SELECT TOP ${promiseSize} r.ID, m.name as BrandName, p.OriginalId, zcl_mess.dbo.fn_mi_pack_toString(j.packnr,j.quantity,j.unit,'abstract') as Package, 
                        p.DescriptionC, p.Description, r.CatalogPrice, zcl_mess.dbo.Fn_get_delivetime(j.JKCat,'CN') AS Delivetime, isnull(p.purity,'N/A') AS Purity, 
                        zcl_mess.dbo.fc_reCAS(p.CAS) AS CasFormat, r.Storage, r.StateName, r.IsDelete, r.ThirdPartyPlatformTemplateTypeId AS Templatetypeid, x.MarketingID
                FROM    (
                        SELECT TOP 1 ID 
                        FROM   ProdData.dbo.Export_ThirdPartyPlatformEntryResult
                        WHERE  CustomerUnitOnPlatformId = '779db9cf4f9b49709ab61140af5e4edf' 
                                AND Id > @iMaxId 
                        ORDER BY Id
                        ) r2
                        INNER JOIN ProdData.dbo.Export_ThirdPartyPlatformEntryResult r ON r.Id = r2.Id
                        INNER JOIN zcl_mess.dbo.jkcat j ON j.JKCat = r.PackageId
                        INNER JOIN zcl_mess.dbo.products p ON p.JKid = j.JKID
                        INNER JOIN zcl_mess.dbo.productschem pc ON pc.JKID = p.JKID
                        INNER JOIN zcl_mess.dbo.manufactory m ON m.code = r.BrandId
                        LEFT JOIN (
                                SELECT  m.MarketingID, pm.jkcat
                                FROM    zcl_mess.dbo.ProductsMarketing pm
                                        INNER JOIN dbs.dbo.marketing m ON pm.MarketingID = m.MarketingID
                                WHERE   m.MStatus = 'E' AND m.Market_code = 'CN' AND m.PStartTime < GETDATE() AND ISNULL( m.PEndTime, '2050-01-01' ) > GETDATE()
                                ) x ON x.jkcat = r.PackageId `;
exports.Tmallab = {
    uq: 'platform/Push',
    type: 'tuid',
    entity: 'tmallab',
    key: 'ID',
    mapper: {
        $id: 'ID',
        货号: "OriginalId",
        品牌: "BrandName",
        包装规格: "Package",
        CAS: "CasFormat",
        目录价str: "CatalogPrice",
        中文名称: "DescriptionC",
        英文名称: "Description",
        交货期: "Delivetime",
        储存温度: "",
        纯度等级: "Purity",
        库存: "Storage",
        MarketingID: "MarketingID",
        templateTypeId: "Templatetypeid",
        stateName: 'StateName',
        isDelete: "IsDelete"
    },
    pull: pullSql,
    pullWrite: tmallabPullWrite_1.tmallabPullWrite,
    firstPullWrite: tmallabPullWrite_1.tmallabPullWrite,
};
//# sourceMappingURL=tmallab.js.map