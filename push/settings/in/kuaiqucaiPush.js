"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//import { UqInTuid } from "../../uq-joint";
const kuaiqucaiPullWrite_1 = require("../../first/converter/kuaiqucaiPullWrite");
const config_1 = __importDefault(require("config"));
const promiseSize = config_1.default.get("promiseSize");
let pullSql = `select * from ( 
                    select r.ID, r.PackageId, zcl_mess.dbo.fc_reCAS(p.CAS) AS CASFormat, p.OriginalId, m.name AS BrandName, 
                        p.DescriptionC, p.Description, r.IsDelete, r.StateName, isnull(p.purity,'N/A') AS Purity, r.ThirdPartyPlatformTemplateTypeId AS Templatetypeid,           
                        j.Packnr, j.Quantity, j.Unit, r.CatalogPrice, r.Discount, r.Storage, zcl_mess.dbo.Fn_get_delivetime_days(j.JKCat, 'CN') AS Delivetime
                    from (
                        SELECT TOP ${promiseSize} * 
                        from ( SELECT r1.PackageId, id
                            FROM   ProdData.dbo.ThirdPartyPlatformEntryResult r1
                            WHERE  r1.CustomerUnitOnPlatformId = '01f9147127be4a178cabdf80ec481f3f' AND r1.SalesRegionID = 'CN' and r1.brandid = 'A01' and isdelete <> 1 and statename = 'add'
                                   AND ID > @iMaxId
                            ) t1  ORDER BY t1.Id
                    ) r2 
                    INNER JOIN ProdData.dbo.ThirdPartyPlatformEntryResult r ON r2.PackageId=r.PackageId AND r2.id=r.Id 
                    INNER JOIN zcl_mess.dbo.jkcat j ON j.JKCat = r.PackageId 
                    INNER JOIN zcl_mess.dbo.products p ON j.JKid = p.JKID 
                    INNER JOIN zcl_mess.dbo.manufactory m ON m.code = p.Manufactory 
                    ) t2`;
exports.KuaiQuCaiPush = {
    uq: '百灵威系统工程部/platformDataPush',
    type: 'tuid',
    entity: 'kuaiqucaiPush',
    key: 'ID',
    mapper: {
        $id: 'ID',
        packageId: "PackageId",
        casFormat: "CasFormat",
        originalId: "OriginalId",
        brandName: "BrandName",
        productName: "Description",
        productNameChinese: "DescriptionC",
        isDelete: "IsDelete",
        stateName: 'StateName',
        purity: "Purity",
        templatetypeid: "Templatetypeid",
        packnr: "Packnr",
        quantity: "Quantity",
        unit: "Unit",
        catalogPrice: "CatalogPrice",
        discount: "Discount",
        storage: "Storage",
        delivery: "Delivetime"
    },
    pull: pullSql,
    pullWrite: kuaiqucaiPullWrite_1.KuaiQuCaiPullWrite,
    firstPullWrite: kuaiqucaiPullWrite_1.KuaiQuCaiPullWrite,
};
//CustomerUnitOnPlatformId = 'e3f8f71734e84d5ba37d37bbd4d7238a' AND r1.StateName = 'add'
//# sourceMappingURL=kuaiqucaiPush.js.map