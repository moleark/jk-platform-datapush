"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cobazaar = void 0;
//import { UqInTuid } from "../../uq-joint";
const cobazaarPullWrite_1 = require("../../first/converter/cobazaarPullWrite");
const config_1 = __importDefault(require("config"));
const promiseSize = config_1.default.get("promiseSize");
let pullSql = `SELECT TOP ${promiseSize} r.ID, m.name, p.OriginalId, zcl_mess.dbo.fn_mi_pack_toString(j.packnr,j.quantity,j.unit,'abstract') as Package
                        ,j.packnr,j.quantity,j.unit
                        , r.ThirdPartyPlatformTemplateTypeId AS Templatetypeid, p.DescriptionC, p.Description, r.CatalogPrice, zcl_mess.dbo.fc_reCAS(p.CAS) AS CasFormat
                        , p.jkid, zcl_mess.dbo.Fn_get_delivetime_days(j.JKCat,'CN') AS Delivetime, isnull(p.purity,'N/A') AS Purity, ISNULL(p.lotnumber,'') AS mdl
                        , IsHazard, r.Storage, r.IsDelete, r.StateName, r.salePrice, r.Discount, x.ActiveDiscount, x.PEndTime 
                FROM    ProdData.dbo.Export_ThirdPartyPlatformEntryResult r
                        INNER JOIN zcl_mess.dbo.jkcat j ON j.JKCat = r.PackageId
                        INNER JOIN zcl_mess.dbo.products p ON j.JKid = p.JKID
                        INNER JOIN zcl_mess.dbo.productschem pc ON pc.JKID = p.JKID
                        INNER JOIN zcl_mess.dbo.manufactory m ON m.code = r.BrandId
                        LEFT JOIN (
                            SELECT  pm.ActiveDiscount, m.PStartTime, m.PEndTime, pm.jkcat
                            FROM    zcl_mess.dbo.ProductsMarketing pm
                                    INNER JOIN dbs.dbo.marketing m ON pm.MarketingID = m.MarketingID
                            WHERE   m.MStatus = 'E' AND m.Market_code = 'CN' AND m.PStartTime < GETDATE() AND ISNULL( m.PEndTime, '2050-01-01' ) > GETDATE()
                            ) x ON x.jkcat = r.PackageId
                WHERE   r.CustomerUnitOnPlatformId = '1cff471fa68949bcb51731e5c6fb176b'
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
        packnr: "packnr",
        quantity: "quantity",
        unit: "unit",
        CAS: "CasFormat",
        deliveryCycle: "Delivetime",
        stock: "Storage",
        purity: "Purity",
        MDL: "mdl",
        jkid: "jkid",
        typeId: "Templatetypeid",
        stateName: 'StateName',
        isDelete: "IsDelete",
        discount: 'Discount',
        activeDiscount: 'ActiveDiscount',
        salePrice: "salePrice",
        pEndTime: 'PEndTime',
        isHazard: 'IsHazard'
    },
    pull: pullSql,
    pullWrite: cobazaarPullWrite_1.CobazaarPullWrite,
    firstPullWrite: cobazaarPullWrite_1.CobazaarPullWrite,
};
//# sourceMappingURL=cobazaar.js.map