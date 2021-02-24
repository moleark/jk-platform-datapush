"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Zcygov = void 0;
//import { UqInTuid } from "../../uq-joint";
const zcygovPullWrite_1 = require("../../first/converter/zcygovPullWrite");
const config_1 = __importDefault(require("config"));
const promiseSize = config_1.default.get("promiseSize");
let pullSql = ` select  r.ID, p.JKID, r.PackageId, zcl_mess.dbo.fc_reCAS(p.CAS) AS CasFormat, p.OriginalId, m.name AS BrandName, r.CatalogPrice, r.SalePrice , 
                        r.Storage, p.DescriptionC, p.Description, zcl_mess.dbo.fn_mi_pack_toString(j.packnr,j.quantity,j.unit,'abstract') AS Package, r.StateName, r.IsDelete, r.ThirdPartyPlatformTemplateTypeId AS Templatetypeid, 
                        CASE WHEN p.purity IS NULL OR p.Purity='' THEN 'N/A' ELSE p.Purity END AS Purity, CASE WHEN p.MF IS NULL OR p.MF='' THEN 'N/A' ELSE p.MF END AS MF, CASE WHEN p.MW IS NULL OR p.MW='' THEN 'N/A' ELSE p.MW END AS MW, CASE WHEN p.lotnumber IS NULL OR p.lotnumber='' THEN 'N/A' ELSE p.lotnumber END AS MDL, CASE WHEN t.descriptionst IS NULL OR t.descriptionst='' THEN 'N/A' ELSE t.descriptionst END AS Store, 
                        zcl_mess.dbo.Fn_get_delivetime(j.JKCat,'CN') AS Delivetime, CASE WHEN m.name='Amethyst' THEN '803808' WHEN m.name='AccuStandard' THEN '903248' ELSE
                        isnull((SELECT  TOP 1 cc.ClassCode
                FROM	opdata.dbo.SaleProductProductCategory dd
                        INNER JOIN opdata.dbo.ProductCategoryLanguage ee ON dd.ProductCategoryID=ee.ProductCategoryID AND ee.LanguageID='zh-CN'
                        INNER JOIN  ProdData.dbo.PlatformUnitCategoryWithJKMapping pm on pm.JKCategoryId = ee.ProductCategoryID and pm.PlatformUnitCode = 'zcygov'
                        LEFT JOIN  ProdData.dbo.PlatformUnitProductCategory cc ON pm.unitcategoryid = cc.id AND cc.PlatformUnitCode = pm.PlatformUnitCode 
                        WHERE dd.SaleProductID= j.jkid ),'1100018') END AS CategoryId
                from (
                    SELECT TOP ${promiseSize} ID
                    FROM   ProdData.dbo.Export_ThirdPartyPlatformEntryResult
                    WHERE  CustomerUnitOnPlatformId = '0e683b79d1494ce2b06a91d533f82fea'
                            AND SalesRegionID = 'CN' and BrandId = 'R35' AND IsHazard = 0 AND ID > @iMaxId 
                    ORDER BY Id
                ) r2
                INNER JOIN ProdData.dbo.Export_ThirdPartyPlatformEntryResult r ON r2.ID = r.ID
                INNER JOIN zcl_mess.dbo.jkcat j ON j.JKCat = r.PackageId
                INNER JOIN zcl_mess.dbo.products p ON j.JKid = p.JKID
                INNER JOIN zcl_mess.dbo.productschem pc ON pc.JKID = p.JKID
                INNER JOIN zcl_mess.dbo.manufactory m ON m.code = r.BrandId
                inner join zcl_mess.dbo.storage t on p.storage = t.CodeST `;
// 
exports.Zcygov = {
    uq: 'platform/Push',
    type: 'tuid',
    entity: 'zcygov',
    key: 'ID',
    mapper: {
        $id: 'ID',
        JKID: "JKID",
        PackageId: "PackageId",
        CasFormat: "CasFormat",
        OriginalId: "OriginalId",
        BrandName: "BrandName",
        CatalogPrice: "CatalogPrice",
        SalePrice: "SalePrice",
        Storage: "Storage",
        DescriptionC: "DescriptionC",
        Description: "Description",
        Package: "Package",
        IsDelete: "IsDelete",
        StateName: 'StateName',
        Purity: "Purity",
        Templatetypeid: "Templatetypeid",
        MF: "MF",
        MW: "MW",
        MDL: "MDL",
        Store: "Store",
        Delivetime: "Delivetime",
        CategoryId: "CategoryId"
    },
    pull: pullSql,
    pullWrite: zcygovPullWrite_1.ZcygovPullWrite,
    firstPullWrite: zcygovPullWrite_1.ZcygovPullWrite,
};
//# sourceMappingURL=zcygov.js.map