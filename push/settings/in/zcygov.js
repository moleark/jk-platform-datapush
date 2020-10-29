"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Zcygov = void 0;
//import { UqInTuid } from "../../uq-joint";
const casmartPullWrite_1 = require("../../first/converter/casmartPullWrite");
const config_1 = __importDefault(require("config"));
const promiseSize = config_1.default.get("promiseSize");
let pullSql = ` `;
exports.Zcygov = {
    uq: 'platform/Push',
    type: 'tuid',
    entity: 'zcygov',
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
    pullWrite: casmartPullWrite_1.CasmartPullWrite,
    firstPullWrite: casmartPullWrite_1.CasmartPullWrite,
};
//# sourceMappingURL=zcygov.js.map