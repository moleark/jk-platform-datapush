import { UqInTuid } from "uq-joint";
//import { UqInTuid } from "../../uq-joint";
import { CasmartPullWrite } from '../../first/converter/casmartPullWrite';
import config from 'config';
const promiseSize = config.get<number>("promiseSize");

let pullSql = `select * from ( 
                    SELECT r.ID, r.PackageId, zcl_mess.dbo.fc_reCAS(p.CAS) AS CasFormat, p.OriginalId, m.name as BrandName, zcl_mess.dbo.fn_mi_pack_toString(j.packnr,j.quantity,j.unit,'abstract') as Package, 
                        r.CatalogPrice, r.SalePrice, r.Storage, p.DescriptionC, p.Description, zcl_mess.dbo.Fn_get_delivetime(j.JKCat,'CN') AS Delivetime,
                        isnull(p.purity,'N/A') AS Purity, r.ThirdPartyPlatformTemplateTypeId AS Templatetypeid,
                        '' AS CategoryId
                        r.StateName, r.IsDelete, r.LastUpdatedTime 
                    from (
                        SELECT TOP ${promiseSize} * 
                            from ( SELECT r1.PackageId, id 
                            FROM   ProdData.dbo.ThirdPartyPlatformEntryResult r1 
                            WHERE  CustomerUnitOnPlatformId = 'eba25a3dd8b34771a134923d9d20cbcc' 
                                AND r1.SalesRegionID = 'CN'
                                AND ID > @iMaxId
                        ) t1 ORDER BY t1.Id
                    ) r2 
                    INNER JOIN ProdData.dbo.ThirdPartyPlatformEntryResult r ON r2.PackageId=r.PackageId AND r2.id = r.Id 
                    INNER JOIN zcl_mess.dbo.jkcat j ON j.JKCat = r.PackageId 
                    INNER JOIN zcl_mess.dbo.products p ON j.JKid = p.JKID 
                    INNER JOIN zcl_mess.dbo.manufactory m ON m.code = r.BrandId
                ) t2 `;

export const CasmartPush: UqInTuid = {
    uq: 'platform/Casmart',
    type: 'tuid',
    entity: 'package',
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
        name: "Description",
        subname: "DescriptionC",
        deliverycycle: "Delivetime",
        intro: "Purity",
        stockamount: "Storage",
        stateName: 'StateName',
        isDelete: "IsDelete",
        lastUpdatedTime: "LastUpdatedTime",
        typeId: "CategoryId"
    },
    pull: pullSql,
    pullWrite: CasmartPullWrite,
    firstPullWrite: CasmartPullWrite,
};
//CustomerUnitOnPlatformId = 'e3f8f71734e84d5ba37d37bbd4d7238a' AND r1.StateName = 'add'
/*
isnull((SELECT TOP 1 pm.UnitCategoryId FROM opdata.dbo.SaleProductProductCategory dd
                            INNER JOIN opdata.dbo.ProductCategoryLanguage ee ON dd.ProductCategoryID=ee.ProductCategoryID AND ee.LanguageID='zh-CN'
                            left join ProdData.dbo.PlatformUnitCategoryWithJKMapping pm on pm.JKCategoryId = ee.ProductCategoryID and pm.PlatformUnitCode = 'casmart'
                            WHERE dd.SaleProductID= r.productid ),'516') AS CategoryId,
*/