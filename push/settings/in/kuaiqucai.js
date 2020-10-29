"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Kuaiqucai = void 0;
//import { UqInTuid } from "../../uq-joint";
const kuaiqucaiPullWrite_1 = require("../../first/converter/kuaiqucaiPullWrite");
const config_1 = __importDefault(require("config"));
const promiseSize = config_1.default.get("promiseSize");
let pullSql = ` select  r.ID, r.PackageId, zcl_mess.dbo.fc_reCAS(p.CAS) AS CasFormat, p.OriginalId, m.name AS BrandName, 
                        p.DescriptionC, p.Description, r.IsDelete, r.StateName, isnull(p.purity,'N/A') AS Purity, r.ThirdPartyPlatformTemplateTypeId AS Templatetypeid,           
                        j.Packnr, j.Quantity, j.Unit, r.CatalogPrice, r.Discount, r.Storage, zcl_mess.dbo.Fn_get_delivetime_days(j.JKCat, 'CN') AS Delivetime, '' as CategoryId
                from (                        
                        SELECT TOP ${promiseSize} ID 
                        FROM   ProdData.dbo.Export_ThirdPartyPlatformEntryResult
                        WHERE  CustomerUnitOnPlatformId = 'b8e92ee96df948fe9e9b88a7db5783a2' 
                            AND SalesRegionID = 'CN' 
                            AND ( CAS<>0 OR BrandId IN ('J18','M64','L50','P30','R35') )
                            AND ID > @iMaxId
                        ORDER BY Id
                    ) r2
                INNER JOIN ProdData.dbo.Export_ThirdPartyPlatformEntryResult r ON r2.ID = r.ID                    
                INNER JOIN zcl_mess.dbo.jkcat j ON j.JKCat = r.PackageId 
                INNER JOIN zcl_mess.dbo.products p ON j.JKid = p.JKID 
                INNER JOIN zcl_mess.dbo.manufactory m ON m.code = p.Manufactory `;
exports.Kuaiqucai = {
    uq: 'platform/Push',
    type: 'tuid',
    entity: 'kuaiqucai',
    key: 'ID',
    mapper: {
        $id: 'ID',
        COMPANY_SALE_NO: "PackageId",
        CasFormat: "CasFormat",
        ARTICLE_NO: "OriginalId",
        BRAND_NAME: "BrandName",
        ProductName: "Description",
        ProductNameChinese: "DescriptionC",
        IsDelete: "IsDelete",
        StateName: 'StateName',
        PURITY: "Purity",
        TemplateTypeId: "Templatetypeid",
        PackNr: "Packnr",
        VALUME: "Quantity",
        VALUMEUNIT_ID: "Unit",
        PRICE: "CatalogPrice",
        DISCOUNT_RATE: "Discount",
        STOCK: "Storage",
        DELIVERYTIME: "Delivetime"
    },
    pull: pullSql,
    pullWrite: kuaiqucaiPullWrite_1.KuaiQuCaiPullWrite,
    firstPullWrite: kuaiqucaiPullWrite_1.KuaiQuCaiPullWrite,
};
//CustomerUnitOnPlatformId = 'e3f8f71734e84d5ba37d37bbd4d7238a' AND r1.StateName = 'add'
//and r1.brandid = 'R35' and isdelete = 1
// 单位只能是以下单位，做到程序里转换
//WHERE j.unit in ('Kg','G','ug','ng','L','ml','μl','l','mg','KG','μmol','ul','u','tablets','t','rxn','mls','rod','pcs','pc'
//,'none','nmol','na','mole','mm','EA','Kunits','Kit','KU','KIT','IU','GR','GM','GAL','G-SB','LT','CM','CLM','CDU','AMP','AM','500U','500IU','000U','SET','VIALS','000IU','UNITS','UNIT','UN','UL','UG','U','T','ZONE','Pak','PIECE'
//,'MU','ML','MIU','ME','M','Lt',  'BL','对','个','支','包','张','盒','袋','瓶','桶','台','EA','套','卷','块','bp','none','片','箱',   'PK', 'BAG', 'BOX' ) 
//# sourceMappingURL=kuaiqucai.js.map