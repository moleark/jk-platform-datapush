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
let pullSql = ` select r.ID, r.PackageId, zcl_mess.dbo.fc_reCAS(p.CAS) AS CasFormat, p.OriginalId, m.name AS BrandName,
                p.DescriptionC, p.Description, r.IsDelete, r.StateName, isnull(p.purity,'N/A') AS Purity, r.ThirdPartyPlatformTemplateTypeId AS Templatetypeid,
                j.Packnr, j.Quantity, j.Unit, r.CatalogPrice, r.Discount, r.Storage, zcl_mess.dbo.Fn_get_delivetime_days(j.JKCat, 'CN') AS Delivetime
                from (
                    SELECT TOP ${promiseSize} ID
                    FROM   ProdData.dbo.Export_ThirdPartyPlatformEntryResult
                    WHERE  CustomerUnitOnPlatformId = '0e683b79d1494ce2b06a91d533f82fea'
                        AND SalesRegionID = 'CN'
                        AND ID > @iMaxId
                    ORDER BY Id
                ) r2
                INNER JOIN ProdData.dbo.Export_ThirdPartyPlatformEntryResult r ON r2.ID = r.ID                 
                INNER JOIN zcl_mess.dbo.jkcat j ON j.JKCat = r.PackageId
                INNER JOIN zcl_mess.dbo.products p ON j.JKid = p.JKID
                INNER JOIN zcl_mess.dbo.manufactory m ON m.code = p.Manufactory `;
exports.Zcygov = {
    uq: 'platform/Push',
    type: 'tuid',
    entity: 'zcygov',
    key: 'ID',
    mapper: {
        $id: 'ID',
        PackageId: "PackageId",
        CasFormat: "CasFormat",
        OriginalId: "OriginalId",
        BrandName: "BrandName",
        Description: "Description",
        DescriptionC: "DescriptionC",
        IsDelete: "IsDelete",
        StateName: 'StateName',
        Purity: "Purity",
        Templatetypeid: "Templatetypeid",
        Packnr: "Packnr",
        Quantity: "Quantity",
        Unit: "Unit",
        CatalogPrice: "CatalogPrice",
        Discount: "Discount",
        Storage: "Storage",
        Delivetime: "Delivetime"
    },
    pull: pullSql,
    pullWrite: zcygovPullWrite_1.ZcygovPullWrite,
    firstPullWrite: zcygovPullWrite_1.ZcygovPullWrite,
};
//# sourceMappingURL=zcygov.js.map