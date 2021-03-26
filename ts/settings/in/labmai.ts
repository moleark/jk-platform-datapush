import { UqInTuid } from "uq-joint";
//import { UqInTuid } from "../../uq-joint";
import { LabmaiPullWrite } from '../../first/converter/labmaiPullWrite';
import config from 'config';
const promiseSize = config.get<number>("promiseSize");

let pullSql = ` SELECT	r.ID, p.JKID, r.PackageId, zcl_mess.dbo.fc_reCAS(p.CAS) AS CasFormat, p.OriginalId,
                        CASE WHEN m.code='A01' THEN '百灵威J&K' WHEN m.code='J34' THEN 'Strem Chemicals' WHEN m.code='K11' THEN 'Frontier Scientific' WHEN m.code='L50' THEN 'Wilmad-labglass' ELSE m.name END AS BrandName, 
                        r.CatalogPrice, r.SalePrice,p.DescriptionC, p.Description, zcl_mess.dbo.fn_mi_pack_toString(j.packnr,j.quantity,j.unit,'abstract') AS Package, r.StateName, r.IsDelete, 
                        r.ThirdPartyPlatformTemplateTypeId AS Templatetypeid, 
                        CASE WHEN p.purity IS NULL OR p.Purity='' THEN 'N/A' ELSE p.Purity END AS Purity, CASE WHEN p.MF IS NULL OR p.MF='' THEN 'N/A' ELSE p.MF END AS MF, 
                        CASE WHEN p.MW IS NULL OR p.MW='' THEN 'N/A' ELSE p.MW END AS MW, CASE WHEN p.lotnumber IS NULL OR p.lotnumber='' THEN 'N/A' ELSE p.lotnumber END AS MDL,
                        CASE WHEN r.BrandId IN ('A01','A10','J34','J29','Q81','K11','J20') THEN 'chem_reagent' WHEN r.BrandId='M64' THEN 'bio_reagent' ELSE 'consumable'END AS SeconClass,
                        CASE WHEN r.BrandId IN ('A01','J34','K11','J20') THEN '有机试剂'
                            WHEN r.BrandId='A10' THEN '通用试剂'
                            WHEN r.BrandId='J29' THEN '分析试剂'
                            WHEN r.BrandId='Q81' THEN '其他化学试剂'
                            WHEN r.BrandId='M64' THEN '其他实验试剂'
                            ELSE ISNULL((SELECT  TOP 1 cc.ThirdClass
                                FROM	opdata.dbo.SaleProductProductCategory dd
                                        INNER JOIN opdata.dbo.ProductCategoryLanguage ee ON dd.ProductCategoryID=ee.ProductCategoryID AND ee.LanguageID='zh-CN'
                                        INNER JOIN  ProdData.dbo.PlatformUnitCategoryWithJKMapping pm on pm.JKCategoryId = ee.ProductCategoryID and pm.PlatformUnitCode = 'labmai'
                                        LEFT JOIN  ProdData.dbo.PlatformUnitProductCategory cc ON pm.unitcategoryid = cc.id AND cc.PlatformUnitCode = pm.PlatformUnitCode 
                                        WHERE dd.SaleProductID= p.JKID),'其他耗材') END AS ThirdClass,s.COL,
                        CASE WHEN CHARINDEX('钢',D.Descriptionc)<>0  AND CHARINDEX('瓶',D.Descriptionc)<>0 THEN '是' ELSE '否' END AS is_cylinder
                from (
                    SELECT TOP ${promiseSize} ID
                    FROM   ProdData.dbo.Export_ThirdPartyPlatformEntryResult
                    WHERE  CustomerUnitOnPlatformId = '7ce085b0405648d1af5cddba00bf7f03'
                            AND SalesRegionID = 'CN' AND ID > @iMaxId  
                            AND BrandId  IN ('A01','A10','J34','J29','Q81','K11','M64','J20','R35','L50')
                        ORDER BY ID
                ) r2
                INNER JOIN ProdData.dbo.Export_ThirdPartyPlatformEntryResult r ON r2.ID = r.ID
                INNER JOIN zcl_mess.dbo.jkcat j ON j.JKCat = r.PackageId
                INNER JOIN zcl_mess.dbo.products p ON j.JKid = p.JKID
                INNER JOIN zcl_mess.dbo.manufactory m ON m.code = r.BrandId
                LEFT JOIN Opdata.dbo.JKProdIDINOut B ON B.JKIDOut=p.OriginalID
                LEFT JOIN zcl_mess.dbo.products_specialmark s ON s.JKID= j.JKid
                LEFT JOIN opdata.dbo.pjkcat C ON C.originalid= B.JKIDIN AND C.PackNr=j.PackNr AND c.Quantity=j.Quantity AND C.Unit=j.Unit
                LEFT JOIN opdata.dbo.sc_nonchemical D ON D.ID=C.Bottle;`;

export const Labmai: UqInTuid = {

    uq: 'platform/Push',
    type: 'tuid',
    entity: 'labmai',  //修改为 package 报错,修改   为package1，命名与moniker表id一致。
    key: 'ID',
    mapper: {
        $id: 'ID',
        JKID: "JKID",
        PackageId: "PackageId",
        CasFormat: "CasFormat",
        OriginalId: "OriginalId",
        BrandName: "BrandName",
        CatalogPrice: "CatalogPrice",
        SalePrice: "SalePrice",
        DescriptionC: "DescriptionC",
        Description: "Description",
        Package: "Package",
        IsDelete: "IsDelete",
        StateName: 'StateName',
        Purity: "Purity",
        Templatetypeid: "Templatetypeid",
        MF: "MF",
        MW: "MW",
        MDL: "MDL",
        SeconClass: "SeconClass",
        ThirdClass: "ThirdClass",
        COL: "COL",
        is_cylinder: "is_cylinder"


    },
    pull: pullSql,
    pullWrite: LabmaiPullWrite,
    firstPullWrite: LabmaiPullWrite,
};