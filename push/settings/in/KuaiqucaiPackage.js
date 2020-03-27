"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kuaiqucaiPullWrite_1 = require("../../first/converter/kuaiqucaiPullWrite");
const config_1 = __importDefault(require("config"));
const promiseSize = config_1.default.get("promiseSize");
let pullSql = `select * from ( 
                    select r.ID, r.PackageId, zcl_mess.dbo.fc_reCAS(p.CAS) AS CasFormat, p.OriginalId, m.name AS BrandName, 
                        p.DescriptionC, p.Description, r.IsDelete, r.StateName, isnull(p.purity,'N/A') AS Purity, r.ThirdPartyPlatformTemplateTypeId AS Templatetypeid,           
                        j.Packnr, j.Quantity, j.Unit, r.CatalogPrice, r.Discount, r.Storage, zcl_mess.dbo.Fn_get_delivetime_days(j.JKCat, 'CN') AS Delivetime, '' as CategoryId
                    from (
                        SELECT TOP ${promiseSize} * 
                        from ( SELECT r1.PackageId, id
                            FROM   ProdData.dbo.ThirdPartyPlatformEntryResult r1
                            WHERE  r1.CustomerUnitOnPlatformId = 'eba25a3dd8b34771a134923d9d20cbcc' AND r1.SalesRegionID = 'CN'  
                                   AND ID > @iMaxId
                            ) t1  ORDER BY t1.Id
                    ) r2 
                    INNER JOIN ProdData.dbo.ThirdPartyPlatformEntryResult r ON r2.PackageId=r.PackageId AND r2.id=r.Id 
                    INNER JOIN zcl_mess.dbo.jkcat j ON j.JKCat = r.PackageId 
                    INNER JOIN zcl_mess.dbo.products p ON j.JKid = p.JKID 
                    INNER JOIN zcl_mess.dbo.manufactory m ON m.code = p.Manufactory 
                    WHERE j.unit in ('Kg','G','ug','ng','L','ml','μl','l','mg','KG','μmol','ul','u','tablets','t','rxn','mls','rod','pcs','pc'
				     ,'none','nmol','na','mole','mm','EA','Kunits','Kit','KU','KIT','IU','GR','GM','GAL','G-SB','LT','CM','CLM','CDU','AMP','AM','500U','500IU','000U','SET','VIALS','000IU','UNITS','UNIT','UN','UL','UG','U','T','ZONE','Pak','PIECE'
			         ,'MU','ML','MIU','ME','M','Lt',  'BL','对','个','支','包','张','盒','袋','瓶','桶','台','EA','套','卷','块','bp','none','片','箱' )
                ) t2 `;
exports.KuaiQuCaiPackage = {
    uq: 'platform/Kuaiqucai',
    type: 'tuid',
    entity: 'package',
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
//# sourceMappingURL=KuaiqucaiPackage.js.map