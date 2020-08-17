import { UqInTuid } from "uq-joint";
//import { UqInTuid } from "../../uq-joint";
import { tmallabPullWrite } from '../../first/converter/tmallabPullWrite';
import config from 'config';
const promiseSize = config.get<number>("promiseSize");

let pullSql = ` SELECT  TOP ${promiseSize} r.ID, m.name as BrandName, p.OriginalId, zcl_mess.dbo.fn_mi_pack_toString(j.packnr,j.quantity,j.unit,'abstract') as Package, 
                        p.DescriptionC, p.Description, r.CatalogPrice, r.saleprice, isnull(p.purity,'N/A') AS Purity, zcl_mess.dbo.fc_reCAS(p.CAS) AS CasFormat, t.DescriptionST, 
                        rp.mdl as mdlNumber, r.Storage, r.IsDelete, r.ThirdPartyPlatformTemplateTypeId AS Templatetypeid, j.JKid, j.packnr,j.unit, r.StateName,
                        zcl_mess.dbo.Fn_get_delivetime(j.JKCat,'CN') AS Delivetime, r.packageid, x.ActiveDiscount, x.PStartTime, x.PEndTime 
                FROM    ProdData.dbo.Export_ThirdPartyPlatformEntryResult r
                        INNER JOIN zcl_mess.dbo.jkcat j ON j.JKCat = r.PackageId
                        INNER JOIN zcl_mess.dbo.products p ON p.JKid = j.JKID
                        INNER join zcl_mess.dbo.storage t on t.CodeST = p.storage
		        INNER join OPDATA.dbo.JKProdIDInOut oi on oi.JKIDOut = p.Originalid and p.manufactory in ( 'A01', 'A10' )
                        INNER join OPDATA.dbo.PProducts rp on rp.OriginalID = oi.JKIDIN
                        INNER JOIN zcl_mess.dbo.manufactory m ON m.code = r.BrandId
                        LEFT JOIN (
                                SELECT  pm.ActiveDiscount, m.PStartTime, m.PEndTime, pm.jkcat 
                                FROM    zcl_mess.dbo.ProductsMarketing pm
                                        INNER JOIN dbs.dbo.marketing m ON pm.MarketingID = m.MarketingID
                                WHERE   m.MStatus = 'E' AND m.Market_code = 'CN' AND m.PStartTime < GETDATE() AND ISNULL( m.PEndTime, '2050-01-01' ) > GETDATE()
                                ) x ON x.jkcat = r.PackageId
                        WHERE  CustomerUnitOnPlatformId = '779db9cf4f9b49709ab61140af5e4edf'
                               AND Id > @iMaxId
                        ORDER BY Id `;

export const Tmallab: UqInTuid = {
        uq: 'platform/Push',
        type: 'tuid',
        entity: 'tmallab',  //修改为 package 报错,修改为package1，命名与moniker表id一致。       
        key: 'ID',
        mapper: {
                $id: 'ID',
                itemNum: "OriginalId",
                brand: "BrandName",
                packingSpecification: "Package",
                casFormat: "CasFormat",
                catalogPrice: "CatalogPrice",
                descriptionC: "DescriptionC",
                description: "Description",
                delivetime: "Delivetime",
                descriptionST: "DescriptionST",
                purity: "Purity",
                storage: "Storage",
                packageId: "packageid",
                mdlNumber: "mdlNumber",
                jkid: "JKid",
                packnr: "packnr",
                unit: "unit",
                activeDiscount: 'ActiveDiscount',
                salePrice: "saleprice",
                pStartTime: 'PStartTime',
                pEndTime: 'PEndTime',
                templateTypeId: "Templatetypeid",
                isDelete: "IsDelete",
                stateName: "StateName"
        },
        pull: pullSql,
        pullWrite: tmallabPullWrite,
        firstPullWrite: tmallabPullWrite,
};
