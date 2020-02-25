import { UqInTuid } from "uq-joint";
//import { UqInTuid } from "../../uq-joint";
import { KuaiQuCaiPullWrite } from '../../first/converter/kuaiqucaiPullWrite';
import config from 'config';
const promiseSize = config.get<number>("promiseSize");

let pullSql = `select * from ( 
                    select r.ID, r.PackageId, zcl_mess.dbo.fc_reCAS(p.CAS) AS CasFormat, p.OriginalId, m.name AS BrandName, 
                        p.DescriptionC, p.Description, r.IsDelete, r.StateName, isnull(p.purity,'N/A') AS Purity, r.ThirdPartyPlatformTemplateTypeId AS Templatetypeid,           
                        j.Packnr, j.Quantity, j.Unit, r.CatalogPrice, r.Discount, r.Storage, zcl_mess.dbo.Fn_get_delivetime_days(j.JKCat, 'CN') AS Delivetime, '' as CategoryId
                    from (
                        SELECT TOP ${promiseSize} * 
                        from ( SELECT r1.PackageId, id
                            FROM   ProdData.dbo.ThirdPartyPlatformEntryResult r1
                            WHERE  r1.CustomerUnitOnPlatformId = 'eba25a3dd8b34771a134923d9d20cbcc' AND r1.SalesRegionID = 'CN' and r1.brandid = 'M64' and isdelete <> 1 
                                   AND ID > @iMaxId
                            ) t1  ORDER BY t1.Id
                    ) r2 
                    INNER JOIN ProdData.dbo.ThirdPartyPlatformEntryResult r ON r2.PackageId=r.PackageId AND r2.id=r.Id 
                    INNER JOIN zcl_mess.dbo.jkcat j ON j.JKCat = r.PackageId 
                    INNER JOIN zcl_mess.dbo.products p ON j.JKid = p.JKID 
                    INNER JOIN zcl_mess.dbo.manufactory m ON m.code = p.Manufactory 
                    ) t2`;

export const KuaiQuCaiPush: UqInTuid = {
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
    pullWrite: KuaiQuCaiPullWrite,
    firstPullWrite: KuaiQuCaiPullWrite,
};
//CustomerUnitOnPlatformId = 'e3f8f71734e84d5ba37d37bbd4d7238a' AND r1.StateName = 'add'