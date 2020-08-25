"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//import { UqInTuid } from "../../uq-joint";
const cobazaarPullWrite_1 = require("../../first/converter/cobazaarPullWrite");
const config_1 = __importDefault(require("config"));
const promiseSize = config_1.default.get("promiseSize");
let pullSql = `SELECT TOP ${promiseSize} r.ID, m.name, p.OriginalId, zcl_mess.dbo.fn_mi_pack_toString(j.packnr,j.quantity,j.unit,'abstract') as Package
                        , r.ThirdPartyPlatformTemplateTypeId AS Templatetypeid, p.DescriptionC, p.Description, r.CatalogPrice, zcl_mess.dbo.fc_reCAS(p.CAS) AS CasFormat
                        , p.jkid, zcl_mess.dbo.Fn_get_delivetime_days(j.JKCat,'CN') AS Delivetime, isnull(p.purity,'N/A') AS Purity, ISNULL(p.lotnumber,'') AS mdl
                        , r.Storage, r.IsDelete, r.StateName
                FROM    ProdData.dbo.Export_ThirdPartyPlatformEntryResult r
                        INNER JOIN zcl_mess.dbo.jkcat j ON j.JKCat = r.PackageId
                        INNER JOIN zcl_mess.dbo.products p ON j.JKid = p.JKID
                        INNER JOIN zcl_mess.dbo.productschem pc ON pc.JKID = p.JKID
                        INNER JOIN zcl_mess.dbo.manufactory m ON m.code = r.BrandId
                WHERE   r.CustomerUnitOnPlatformId = 'e3f8f71734e84d5ba37d37bbd4d7238a'
                AND r.ID > @iMaxId
                ORDER BY Id;`;
exports.Cobazaar = {
    uq: 'platform/Push',
    type: 'tuid',
    entity: 'cobazaar',
    key: 'ID',
    mapper: {
        $id: 'ID',
        brandName: "name",
        originalId: "OriginalId",
        packageSize: "Package",
        chineseName: "DescriptionC",
        englishName: "Description",
        catalogPrice: "CatalogPrice",
        CAS: "CasFormat",
        delivery: "Delivetime",
        stock: "Storage",
        purity: "Purity",
        MDL: "mdl",
        jkid: "jkid",
        typeId: "Templatetypeid",
        stateName: 'StateName',
        isDelete: "IsDelete"
    },
    pull: pullSql,
    pullWrite: cobazaarPullWrite_1.CobazaarPullWrite,
    firstPullWrite: cobazaarPullWrite_1.CobazaarPullWrite,
};
//# sourceMappingURL=cobazaar.js.map