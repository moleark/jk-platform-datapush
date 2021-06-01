"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Casmart = void 0;
//import { UqInTuid } from "../../uq-joint";
const casmartPullWrite_1 = require("../../first/converter/casmartPullWrite");
const config_1 = __importDefault(require("config"));
const promiseSize = config_1.default.get("promiseSize");
/*
2021.05.27
喀斯玛活动 为期一个月 6月份 结束后需要改回来.
活动内容:如下两个产品,用目录价做满一赠一,因为现在是83折,需要恢复为目录价
修改方案:1.result表更新这四个包装的 lastupdatetime
         2.喀斯玛推送数据 加限制 只要是这四个包装不打折
            
    J&K 974643  100ML	196		A019746431_100_ML
                500ML	256		A019746431_500_ML
                1L		440		A019746431_1_L
        247387	100ML	327		A01T060010100
*/
let pullSql = `SELECT  TOP ${promiseSize} r.ID, r.PackageId, zcl_mess.dbo.fc_reCAS(p.CAS) AS CasFormat, p.OriginalId, m.name as BrandName, r.CatalogPrice,
                        CASE WHEN r.PackageId IN ('A019746431_100_ML','A019746431_500_ML','A019746431_1_L','A01T060010100') THEN r.CatalogPrice ELSE r.SalePrice END AS SalePrice,
                        r.Storage, p.DescriptionC, p.Description, zcl_mess.dbo.fn_mi_pack_toString(j.packnr,j.quantity,j.unit,'abstract') as Package, r.StateName, r.IsDelete, 
                        isnull(p.purity,'N/A') AS Purity, r.ThirdPartyPlatformTemplateTypeId AS Templatetypeid, REPLACE(REPLACE(isnull(p.MF,'N/A'),'+',''),'?','') AS MF,
                        zcl_mess.dbo.Fn_get_delivetime(j.JKCat,'CN') AS Delivetime, (CASE WHEN sc.chemid IS NULL  then 'No' ELSE 'Yes' END ) as IsWX, j.jkid,
                        isnull((SELECT  TOP 1 cc.ClassCode 
                        FROM	opdata.dbo.SaleProductProductCategory dd
                                INNER JOIN opdata.dbo.ProductCategoryLanguage ee ON dd.ProductCategoryID=ee.ProductCategoryID AND ee.LanguageID='zh-CN'
                                inner join ProdData.dbo.PlatformUnitCategoryWithJKMapping pm on pm.JKCategoryId = ee.ProductCategoryID and pm.PlatformUnitCode = 'casmart'
                                LEFT JOIN  ProdData.dbo.PlatformUnitProductCategory cc ON pm.unitcategoryid = cc.id AND cc.PlatformUnitCode = pm.PlatformUnitCode 
                                WHERE dd.SaleProductID= j.jkid ),'516') AS CategoryId 
                FROM    ProdData.dbo.Export_ThirdPartyPlatformEntryResult r
                        INNER JOIN zcl_mess.dbo.jkcat j ON j.JKCat = r.PackageId
                        INNER JOIN zcl_mess.dbo.products p ON j.JKid = p.JKID
                        INNER JOIN zcl_mess.dbo.productschem pc ON pc.JKID = p.JKID
                        INNER JOIN zcl_mess.dbo.manufactory m ON m.code = r.BrandId
                        LEFT  JOIN zcl_mess.dbo.sc_restrict sc ON sc.chemid = pc.chemid
                WHERE   r.CustomerUnitOnPlatformId = 'e3f8f71734e84d5ba37d37bbd4d7238a' 
                        AND r.ID > @iMaxId
                ORDER BY Id; `;
exports.Casmart = {
    uq: 'platform/Push',
    type: 'tuid',
    entity: 'casmart',
    key: 'ID',
    mapper: {
        $id: 'ID',
        templateTypeId: "Templatetypeid",
        rid: "PackageId",
        code: "OriginalId",
        brandName: "BrandName",
        spec: "Package",
        cascode: "CasFormat",
        mktprice: "CatalogPrice",
        price: "SalePrice",
        name: "DescriptionC",
        subname: "Description",
        deliverycycle: "Delivetime",
        purity: "Purity",
        mf: "MF",
        productId: "jkid",
        stockamount: "Storage",
        stateName: 'StateName',
        isDelete: "IsDelete",
        typeId: "CategoryId",
        iswx: "IsWX"
    },
    pull: pullSql,
    pullWrite: casmartPullWrite_1.CasmartPullWrite,
    firstPullWrite: casmartPullWrite_1.CasmartPullWrite,
};
//# sourceMappingURL=casmart.js.map