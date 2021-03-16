"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tmallab = void 0;
//import { UqInTuid } from "../../uq-joint";
const tmallabPullWrite_1 = require("../../first/converter/tmallabPullWrite");
const config_1 = __importDefault(require("config"));
const promiseSize = config_1.default.get("promiseSize");
let pullSql = ` SELECT  TOP ${promiseSize} r.ID, m.name as BrandName, p.OriginalId, zcl_mess.dbo.fn_mi_pack_toString(j.packnr,j.quantity,j.unit,'abstract') as Package,
            p.DescriptionC, p.Description, r.CatalogPrice, r.saleprice, isnull(p.purity,'N/A') AS Purity, zcl_mess.dbo.fc_reCAS(p.CAS) AS CasFormat, t.DescriptionST,
            rp.mdl as mdlNumber, r.Storage, r.IsDelete, r.ThirdPartyPlatformTemplateTypeId AS Templatetypeid, j.JKid, j.packnr,j.unit, r.StateName,
            zcl_mess.dbo.Fn_get_delivetime(j.JKCat,'CN') AS Delivetime, r.packageid, S.ActiveDiscount,CASE S.ActiveDiscount WHEN '0.6' THEN '2021-03-16' ELSE x.PStartTime END AS PStartTime,
            CASE S.ActiveDiscount WHEN '0.6' THEN '2021-08-31' ELSE x.PEndTime END AS PEndTime
    FROM    ProdData.dbo.Export_ThirdPartyPlatformEntryResult r
            INNER JOIN zcl_mess.dbo.jkcat j ON j.JKCat = r.PackageId
            INNER JOIN zcl_mess.dbo.products p ON p.JKid = j.JKID
            INNER JOIN zcl_mess.dbo.manufactory m ON m.code = r.BrandId
            LEFT JOIN zcl_mess.dbo.storage t on t.CodeST = p.storage
            LEFT JOIN OPDATA.dbo.JKProdIDInOut oi on oi.JKIDOut = p.Originalid and p.manufactory in ( 'A01', 'A10' )
            LEFT JOIN OPDATA.dbo.PProducts rp on rp.OriginalID = oi.JKIDIN
            LEFT JOIN (
                    SELECT   m.PStartTime, m.PEndTime, pm.jkcat
                    FROM    zcl_mess.dbo.ProductsMarketing pm
                            INNER JOIN dbs.dbo.marketing m ON pm.MarketingID = m.MarketingID
                    WHERE   m.MStatus = 'E' AND m.Market_code = 'CN' AND m.PStartTime < GETDATE() AND ISNULL( m.PEndTime, '2050-01-01' ) > GETDATE()
                    ) x ON x.jkcat = r.PackageId
            LEFT JOIN (
                    SELECT SaleProductID,'0.6' AS ActiveDiscount
                    FROM OPDATA.dbo.SaleProductProductCategory
                    WHERE ProductCategoryID IN ( 412, 122, 133, 123 )
                            AND SUBSTRING(SaleProductID, 1, 3) IN ( 'A01', 'A10' )
                            AND IsValid=1
                    )  S ON S.SaleProductID =p.JKID
    WHERE   CustomerUnitOnPlatformId = '779db9cf4f9b49709ab61140af5e4edf'
            AND Id > @iMaxId
    ORDER BY Id; `;
exports.Tmallab = {
    uq: 'platform/Push',
    type: 'tuid',
    entity: 'tmallab',
    key: 'ID',
    mapper: {
        $id: 'ID',
        itemNum: "OriginalId",
        brand: "BrandName",
        packingSpecification: "Package",
        casFormat: "CasFormat",
        catalogPrice: "CatalogPrice",
        descriptionC: "DescriptionC",
        description: "Description",
        delivetime: "Delivetime",
        descriptionST: "DescriptionST",
        purity: "Purity",
        storage: "Storage",
        packageId: "packageid",
        mdlNumber: "mdlNumber",
        jkid: "JKid",
        packnr: "packnr",
        unit: "unit",
        activeDiscount: 'ActiveDiscount',
        salePrice: "saleprice",
        pStartTime: 'PStartTime',
        pEndTime: 'PEndTime',
        templateTypeId: "Templatetypeid",
        isDelete: "IsDelete",
        stateName: "StateName"
    },
    pull: pullSql,
    pullWrite: tmallabPullWrite_1.tmallabPullWrite,
    firstPullWrite: tmallabPullWrite_1.tmallabPullWrite,
};
//# sourceMappingURL=tmallab.js.map