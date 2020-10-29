import { UqInTuid } from "uq-joint";
//import { UqInTuid } from "../../uq-joint";
import { CasmartPullWrite } from '../../first/converter/casmartPullWrite';
import config from 'config';
const promiseSize = config.get<number>("promiseSize");

let pullSql = ` `;

export const Zcygov: UqInTuid = {
    uq: 'platform/Push',
    type: 'tuid',
    entity: 'zcygov',  //修改为 package 报错,修改为package1，命名与moniker表id一致。
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
        name: "DescriptionC",
        subname: "Description",
        deliverycycle: "Delivetime",
        purity: "Purity",
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