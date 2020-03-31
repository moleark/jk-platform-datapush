import { UqInTuid } from "uq-joint";
//import { UqInTuid } from "../../uq-joint";
import { CasmartPullWrite } from '../../first/converter/casmartPullWrite';
import config from 'config';
const promiseSize = config.get<number>("promiseSize");

let pullSql = ` SELECT  r.ID, r.PackageId, zcl_mess.dbo.fc_reCAS(p.CAS) AS CasFormat, p.OriginalId, m.name as BrandName, r.CatalogPrice, r.SalePrice, r.Storage, 
                        p.DescriptionC, p.Description, zcl_mess.dbo.fn_mi_pack_toString(j.packnr,j.quantity,j.unit,'abstract') as Package, 
                        zcl_mess.dbo.Fn_get_delivetime(j.JKCat,'CN') AS Delivetime, r.StateName, r.IsDelete, 
                        isnull(p.purity,'N/A') AS Purity, r.ThirdPartyPlatformTemplateTypeId AS Templatetypeid, isnull(p.MF,'N/A') AS MF,
                        (SELECT  CASE when EXISTS(SELECT 1 FROM zcl_mess.dbo.sc_restrict WHERE chemid=pc.chemid)  then 'Yes' ELSE 'No' END ) as IsWX,
                        isnull((SELECT  TOP 1 cc.ClassCode 
                                FROM	opdata.dbo.SaleProductProductCategory dd
                                        INNER JOIN opdata.dbo.ProductCategoryLanguage ee ON dd.ProductCategoryID=ee.ProductCategoryID AND ee.LanguageID='zh-CN'
                                        inner join ProdData.dbo.PlatformUnitCategoryWithJKMapping pm on pm.JKCategoryId = ee.ProductCategoryID and pm.PlatformUnitCode = 'casmart'
                                        LEFT JOIN  ProdData.dbo.PlatformUnitProductCategory cc ON pm.unitcategoryid = cc.id AND cc.PlatformUnitCode = pm.PlatformUnitCode 
                                        WHERE dd.SaleProductID= r.productid ),'516') AS CategoryId 
                from (  SELECT  TOP ${promiseSize} ID 
                        FROM    ProdData.dbo.ThirdPartyPlatformEntryResult
                        WHERE   CustomerUnitOnPlatformId = 'e3f8f71734e84d5ba37d37bbd4d7238a' 
                                AND SalesRegionID = 'CN' 
                                AND ID > @iMaxId
                        ORDER BY ID ) r2 
                INNER JOIN ProdData.dbo.ThirdPartyPlatformEntryResult r ON r2.ID = r.ID  
                INNER JOIN zcl_mess.dbo.jkcat j ON j.JKCat = r.PackageId 
                INNER JOIN zcl_mess.dbo.products p ON j.JKid = p.JKID 
                INNER JOIN zcl_mess.dbo.manufactory m ON m.code = r.BrandId
                INNER JOIN zcl_mess.dbo.productschem pc ON pc.JKID = p.JKID `;

export const Casmart: UqInTuid = {
        uq: 'platform/Push',
        type: 'tuid',
        entity: 'casmart',  //修改为 package 报错,修改为package1，命名与moniker表id一致。
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
                mf: "MF",
                stockamount: "Storage",
                stateName: 'StateName',
                isDelete: "IsDelete",
                typeId: "CategoryId",
                iswx: "IsWX"
        },
        pull: pullSql,
        pullWrite: CasmartPullWrite,
        firstPullWrite: CasmartPullWrite,
};

// LEFT JOIN zcl_mess.dbo.sc_restrict sc ON sc.chemid = pc.ChemID
// ( CASE WHEN sc.chemid IS NULL THEN 'No' ELSE 'Yes' end ) AS IsWX, 
