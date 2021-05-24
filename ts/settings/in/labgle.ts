import { UqInTuid } from "uq-joint";
import config from 'config';
import { labglePullWrite } from "../../first/converter/labglePullWrite";

const promiseSize = config.get<number>("promiseSize");

let pullSql = `SELECT TOP ${promiseSize} r.ID, m.name AS Brand, p.OriginalID, ISNULL(p.LotNumber, '') AS mdl, zcl_mess.dbo.fc_reCAS(p.CAS) AS CasFormat,  p.Description,
                p.DescriptionC, REPLACE(REPLACE(ISNULL(p.MF, 'N/A'), '+', ''), '?', '') AS MF, ISNULL(p.MW, 'N/A') AS MW,ISNULL(p.Purity, 'N/A') AS Purity, 
                zcl_mess.dbo.Fn_get_delivetime(j.JKCat, 'CN') AS Delivetime, CASE r.StateName WHEN 'delete' THEN  'INACTIVE' ELSE 'ACTIVE'  END AS StateName,
                zcl_mess.dbo.fn_mi_pack_toString(j.PackNr, j.Quantity, j.Unit, 'abstract') AS Package, r.CatalogPrice, r.SalePrice,
                r.Storage,r.ThirdPartyPlatformTemplateTypeId AS Templatetypeid, p.JKID, r.IsHazard
                FROM ProdData.dbo.Export_ThirdPartyPlatformEntryResult r
                    INNER JOIN zcl_mess.dbo.jkcat j ON j.JKCat = r.PackageId
                    INNER JOIN zcl_mess.dbo.Products p ON j.JKid = p.JKID
                    INNER JOIN zcl_mess.dbo.manufactory m ON m.code = r.BrandId
                WHERE r.CustomerUnitOnPlatformId = '1767cb5cea7340c0adad74b7ff3fb530'
                    AND r.BrandId IN ('A01','A10','J29','J34')
                    AND r.Id > @iMaxId
                ORDER BY Id;`;

export const labgle: UqInTuid = {
    uq: 'platform/Push',
    type: 'tuid',
    entity: 'labgle',
    key: 'ID',
    mapper: {
        $id: 'ID',
        brandName: "Brand",
        originalId: "OriginalID",
        mdl: "mdl",
        casFormat: "CasFormat",
        descriptionC: "DescriptionC",
        description: "Description",
        mf: "MF",
        mw: "MW",
        purity: "Purity",
        deliverycycle: "Delivetime",
        stateName: 'StateName',
        package: "Package",
        catalogPrice: "CatalogPrice",
        salePrice: "SalePrice",
        templateTypeId: "Templatetypeid",
        stockamount: "Storage",
        productId: "JKID"
    },
    pull: pullSql,
    pullWrite: labglePullWrite,
    firstPullWrite: labglePullWrite,
};