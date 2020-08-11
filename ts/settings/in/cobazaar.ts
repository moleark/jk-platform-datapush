import { UqInTuid } from "uq-joint";
//import { UqInTuid } from "../../uq-joint";
import { CobazaarPullWrite } from '../../first/converter/cobazaarPullWrite';
import config from 'config';
const promiseSize = config.get<number>("promiseSize");

let pullSql = `SELECT TOP ${promiseSize} r.ID, m.name as BrandName, p.OriginalId, zcl_mess.dbo.fn_mi_pack_toString(j.packnr,j.quantity,j.unit,'abstract') as PackageSize
                        , r.ThirdPartyPlatformTemplateTypeId AS Templatetypeid, p.DescriptionC, p.Description, r.CatalogPrice, zcl_mess.dbo.fc_reCAS(p.CAS) AS CasFormat
                        , p.jkid, zcl_mess.dbo.Fn_get_delivetime(j.JKCat,'CN') AS Delivetime, isnull(p.purity,'N/A') AS Purity, ISNULL(p.lotnumber,'') AS mdl
                        , r.IsDelete, r.StateName
                        FROM    ProdData.dbo.ThirdPartyPlatformEntryResult r
                        INNER JOIN zcl_mess.dbo.jkcat j ON j.JKCat = r.PackageId
                        INNER JOIN zcl_mess.dbo.products p ON j.JKid = p.JKID
                        INNER JOIN zcl_mess.dbo.productschem pc ON pc.JKID = p.JKID
                        INNER JOIN zcl_mess.dbo.manufactory m ON m.code = r.BrandId
                WHERE   r.CustomerUnitOnPlatformId = 'e3f8f71734e84d5ba37d37bbd4d7238a'
                AND r.ID > @iMaxId
                ORDER BY Id;`;

export const Cobazaar: UqInTuid = {
    uq: 'platform/Push',
    type: 'tuid',
    entity: 'cobazaar',  //
    key: 'ID',
    mapper: {
        $id: 'ID',
        品牌: "BrandName",
        货号: "OriginalId",
        包装规格: "PackageSize",
        中文名称: "DescriptionC",
        英文名称: "Description",
        目录价: "CatalogPrice",
        CAS: "CasFormat",
        交货期: "Delivetime",
        纯度: "Purity",
        MDL: "mdl",
        jkid: "jkid",
        typeId: "Templatetypeid",
        stateName: 'StateName',
        isDelete: "IsDelete"
    },
    pull: pullSql,
    pullWrite: CobazaarPullWrite,
    firstPullWrite: CobazaarPullWrite,
};