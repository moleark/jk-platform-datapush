"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
const idBrokened = config_1.default.get("idBrokened");
const promiseSize = config_1.default.get("promiseSize");
exports.sqls = {
    //==============================================================
    //=========================== Common ===========================
    //==============================================================
    readPackTypeStandard: `
                select top ${promiseSize} a.ID, a.Unit, b.Name
                from opdata.dbo.JNKStandardUnit a
                        inner join opdata.dbo.JNKStandardUnitType b on a.UnitTypeId = b.ID
                where a.ID > @iMaxId
                order by a.ID`,
    readPackType: `
                select top ${promiseSize} a.ID, a.UnitE, a.UnitC, a.StandardUnitID
                from opdata.dbo.SupplierPackingUnit a
                where a.ID > @iMaxId
                order by a.ID`,
    readCurrency: `
                select top ${promiseSize} currency as ID
                from zcl_mess.dbo.vw_currency_now
                where currency > @iMaxId
                order by currency`,
    readSalesRegion: `
                select top ${promiseSize} market_code as ID, Market_name, Currency
                from zcl_mess.dbo.market
                where market_code > @iMaxId
                order by market_code`,
    readLanguage: `
                select top ${promiseSize} LanguageID as ID, LanguageStr
                from dbs.dbo.Languages
                where LanguageId > @iMaxId
                order by LanguageID`,
    readCountry: `
                select top ${promiseSize} code as ID, Countries, ChineseName, Status as IsValid, [Order]
                from dbs.dbo.CountryCode1
                where code > @iMaxId and level = 1
                order by code`,
    readProvince: `
                select top ${promiseSize} code as ID, Countries, ChineseName, parentCode, Status as IsValid, [Order]
                from dbs.dbo.CountryCode1
                where code > @iMaxId and level = 2
                order by code`,
    readCity: `
                select top ${promiseSize} code as ID, Countries, ChineseName, parentCode, Status as IsValid, [Order]
                from dbs.dbo.CountryCode1
                where code > @iMaxId and level = 3
                order by code`,
    readCounty: `
                select top ${promiseSize} code as ID, Countries, ChineseName, parentCode, Status as IsValid, [Order]
                from dbs.dbo.CountryCode1
                where code > @iMaxId and level = 4
                order by code`,
    readInvoiceType: `
                select top ${promiseSize} ID, description
                from (
                    select 1 as ID, '普通发票' as Description
                    union
                    select 2 as ID, '增值税发票' as Description
                ) t where ID > @iMaxId
                order by ID`,
    //==============================================================
    //=========================== chemical ===========================
    //==============================================================
    readEmployee: `
                select top ${promiseSize} epid as ID, ChineseName, EpName1, EpName2, Title, Status, Creadate as CreateTime
                from dbs.dbo.Employee where epid > @iMaxId and ChineseName is not null order by epid`,
    //==============================================================
    //=========================== chemical ===========================
    //==============================================================
    readChemical: `
                select top ${promiseSize}
                chemID as ID, CAS, Description, DescriptionC, MolWeight, MolFomula, MdlNumber
                from opdata.dbo.sc_chemical
                where reliability = 0 and chemID > @iMaxId and chemID > ${idBrokened.chemid} order by chemID
                        `,
    //==============================================================
    //=========================== customer ===========================
    //==============================================================
    readCustomer: `
                select top ${promiseSize} CID as ID, CID as CustomerID, UnitID as OrganizationID, Name, FirstName, LastName, XYZ, Sex as Gender
                        , convert(nvarchar(30), BirthDate, 121) as BirthDate
                        , Tel1, Tel2, Mobile, Email, Email2, Fax1, Fax2, Zip
                        , BuyersAcName as InvoiceTitle, BuyersTaxNo as TaxNo, CompanyRegisteredAddress as RegisteredAddress
                        , CompanyTelephone as RegisteredTelephone, BankName, BankAccountNumber
                        , EPR as SalesmanID, CustomerServiceEPR as CustomerServiceStuffID
                        , case C5 when 'xx' then 0 else 1 end as IsValid
                        , SaleComanyID as SalesCompanyID
                        , saleRegionBelongsTo as SalesRegionBelongsTo
                        , convert(nvarchar(30), creaDate, 121) as CreateTime
                from dbs.dbo.Customers where CID > @iMaxId and CID > '${idBrokened.CID}' and Name is not null order by CID`,
    readBuyerAccount: `
                select top ${promiseSize} CID as ID, CID as BuyerAccountID, UnitID as OrganizationID, Name, FirstName, LastName, XYZ, Sex as Gender
                        , case C5 when 'xx' then 0 else 1 end as IsValid
                        , creaDate as CreateTime
                from dbs.dbo.Customers where CID > @iMaxId and CID in (select CID from dbs.dbo.vw_sordersBJSH)
                and CID > '${idBrokened.BuyerAccountID}' and Name is not null order by CID`,
    /*
    readBuyerAccount: `
            select top ${promiseSize} c.ID as ID, isnull(r.Contractor, c.CID) as BuyerAccountID
                    , cc.UnitID as OrganizationID, cc.Name, cc.FirstName, cc.LastName, cc.XYZ, cc.Sex as Gender
                    , case cc.C5 when 'xx' then 0 else 1 end as IsValid
                    , cc.creaDate as CreateTime
            from alidb.jk_eb.dbo.ClientInfo c inner join alidb.jk_eb.dbo.ClientLogin cl on cl.CIID = c.ID
                 inner join dbs.dbo.Customers cc on c.CID = cc.CID
                 left join alidb.jk_eb.dbo.MakeOrderPersonAndContractorRelationship r on c.CID = r.MakeOrderCID
            where c.ID > @iMaxId and cl.State in ( 1, 5 )
            and c.ID > '${idBrokened.BuyerAccountID}' and c.CID is not null order by c.ID`,
    */
    readOrganization: `
                select top ${promiseSize} UnitID as ID, UnitID as OrganizationID, unitName as Name, convert(nvarchar(30), creaDate, 121) as CreateTime
                from dbs.dbo.CustUnits where UnitID > @iMaxId order by UnitID`,
    readCustomerShippingAddress: `
                select top ${promiseSize} ID, ID as ContactID, CID as CustomerID, userName as Name, userUnit as OrganizationName, isnull(userMobile, '') as Mobile
                    , email as Email, userZipCode as Zip, userAdd as Addr, isDefault, 0 as AddressType
                from dbs.dbo.net_OrderBase_txt where id > @iMaxId and userName is not null order by ID`,
    readCustomerInvoiceAddress: `
                select top ${promiseSize} ID, ID as ContactID, CID as CustomerID, Name, Unit as OrganizationName, isnull(Mobile, '') as Mobile, Tel as Telephone
                    , Email, Zip, Addr, isDefault, 1 as AddressType
                from dbs.dbo.order_InvoiceInfo_txt where ID > @iMaxId and Name is not null order by ID`,
    readCustomerBuyerAccount: `
                select top ${promiseSize} MakeOrderCID as ID, MakeOrderCID as CustomerID, Contractor as BuyerAccountID, '-' as [$]
                from dbs.dbo.MakeOrderPersonAndContractorRelationship
                where MakeOrderCID > @iMaxId and inValid = 0 order by MakeOrderCID`,
    //==============================================================
    //=========================== Product ===========================
    //==============================================================
    readBrand: `
                select top ${promiseSize} code as ID, Code as BrandID, name as BrandName from zcl_mess.dbo.manufactory where code > @iMaxId order by code`,
    readProduct: `
                select top ${promiseSize} p.jkid as ID, p.jkid as ProductID, p.manufactory as BrandID, p.originalId as ProductNumber
                        , isnull(p.Description, 'N/A') as Description, p.DescriptionC
                        , pc.chemid as ChemicalID, zcl_mess.dbo.fc_recas(p.CAS) as CAS, p.MF as MolecularFomula, p.MW as MolecularWeight, p.Purity
                        , p.[Restrict], p.LotNumber as MdlNumber, 1 as IsValid
                        -- , case when(select count(pv.jkid) from zcl_mess.dbo.Invalid_Products pv where pv.jkid = p.jkid) > 0 then 0 else 1 end as IsValid
                from zcl_mess.dbo.products p inner join zcl_mess.dbo.productschem pc on pc.jkid = p.jkid
                where p.jkid > @iMaxId and p.jkid > '${idBrokened.jkid}'
                      and p.jkid not in ( select jkid from zcl_mess.dbo.Invalid_products ) order by p.jkid`,
    readProductLegallyProhibited: `
                select top ${promiseSize} jkid + market_code as ID, jkid as ProductID, market_code as SalesRegionID, left(description, 20) as Reason
                from zcl_mess.dbo.sc_safe_ProdCache where jkid + market_code > @iMaxId order by jkid + market_code`,
    readProductExtensionProperty: `
                select top ${promiseSize} p.JKID as ID, p.jkid as ProductID, pp.Synonymity, pp.SynonymityC, pp.MDL, pp.EINECS, pp.Beilstein
                        , pp.FP, pp.MP, pp.BP, pp.Density
                from opdata.dbo.pproducts pp inner join opdata.dbo.JKProdIDinout oi on oi.jkidin = pp.originalID
                inner join zcl_mess.dbo.Products p on p.OriginalID = oi.JKIDOut and p.Manufactory in ( 'A01', 'A10' )
                where p.jkid > @iMaxId
                and p.jkid not in ( select jkid from zcl_mess.dbo.Invalid_products ) order by p.jkid`,
    //==============================================================
    //=========================== ProductCategory ===========================
    //==============================================================
    readProductCategory: `
                select top ${promiseSize} pc.ProductCategoryID as ID, pc.ProductCategoryID, pc.ParentProductCategoryID, pc.OrderWithinParentCatetory as OrderWithinParentCategory,
                        pc.IsLeaf, pc.IsValid, pc.IsShow from opdata.dbo.ProductCategory pc
                where pc.ProductCategoryID > @iMaxId order by pc.ProductCategoryID`,
    readProductCategoryLanguage: `
                select top ${promiseSize} ID, ID as ProductCategoryLanguageID, ProductCategoryID, LanguageID, ProductCategoryName
                from opdata.dbo.ProductCategoryLanguage where ID > @iMaxId order by ID`,
    readProductProductCategory: `
                select top ${promiseSize} ID, ID as SaleProductProductCategoryID, SaleProductID, ProductCategoryID, IsValid
                from opdata.dbo.SaleProductProductCategory where ID > @iMaxId and ID > ${idBrokened.PPCID} order by ID`,
    //==============================================================
    //=========================== Warehouse ===========================
    //==============================================================
    readWarehouse: `
                select top ${promiseSize} CompanyID as ID, CompanyID as WarehouseID, companyName as WarehouseName, companyAddr
                from dbs.dbo.Scompany where CompanyID > @iMaxId order by CompanyId`,
    readSalesRegionWarehouse: `
                select top ${promiseSize} ID, CompanyID as WarehouseID, Location as SalesRegionID, minDeliverTime, maxDeliverTime
                from dbs.dbo.CompanyLocation where ID > @iMaxId order by Id`,
    //==============================================================
    //=========================== Promotion ===========================
    //==============================================================
    readPromotionType: `select top ${promiseSize} MType as ID, MType as MarketingTypeID, MTypeName as Description
                from dbs.dbo.MarketingType where MType > @iMaxId order by MType`,
    readPromotionStatus: `select top ${promiseSize} MStatus as ID, MStatus as MarketingStatusID, MStatusName as Description
                from dbs.dbo.MarketingStatus where MStatus > @iMaxId order by MStatus`,
    readPromotion: `select top ${promiseSize} MarketingID as ID, MarketingID, Name
                        , mType as Type, mstatus as Status, PStartTime as StartDate, PendTime as EndDate, market_code as SalesRegionID, inputtime as CreateTime
                from dbs.dbo.Marketing where MarketingID > @iMaxId and PStartTime is not null and isnull(PEndTime, '2029-12-01') > getdate() order by MarketingID`,
    //==============================================================
    //=========================== Agreement ===========================
    //==============================================================
    readAgreement: `select top ${promiseSize} AgreementId as ID, AgreementID, ObjType
                from dbs.dbo.Agreement where AgreementID > @iMaxId and objType in ('C', 'U')  order by AgreementId`,
};
//# sourceMappingURL=sqls.js.map