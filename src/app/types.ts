export interface IUser {
    id?: number;
    email?: string;
    document?: string;
    firstName?: string;
    lastName?: string;
    groups: Array<any>;
    phone?: string;
    password?: string;
    repeatPassword?: string;
    role?: string;
    roleName?: string;
    fullName?: string;
    subsidiaryId?: string;
    subsidiaryName?: string;
    isActive?: boolean;
    isSuperuser?: boolean;
    avatar?: string | ArrayBuffer | null;
    avatarUrl?: string;
    refreshToken?: string;
    accessToken?: string;
    exp?: number;
    origIat?: number;
}
export interface ICompany {
    id?: number;
    typeDoc?: string;
    doc?: string;
    businessName?: string;
    shortName?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string | ArrayBuffer | null;
    userSol?: string;
    keySol?: string;
    limit?: number;
    emissionInvoiceWithPreviousDate?: number;
    emissionReceiptWithPreviousDate?: number;
    includeIgv?: boolean;
    percentageIgv?: number;
    isEnabled?: boolean;
    isProduction?: boolean;
    productionDate?: string;
    disabledDate?: string;
    passwordSignature?: string;
    certification?: string | ArrayBuffer | null;
    certificationKey?: string | ArrayBuffer | null;
    certificationExpirationDate?: string;
    withStock?: boolean;
    catalog?: boolean;
    invoiceF?: boolean;
    invoiceB?: boolean;
    guide?: boolean;
    app?: boolean;
}
export interface IPerson {
    id: number;
    documentNumber?: string;
    documentType?: string;
    names?: string;
    shortName?: string;
    address: string;

    departmentId: string;
    provinceId: string;
    districtId: string;
    countryReadable: string;
    country: string;
    economicActivityMain?: number;
    economicActivityMainReadable?: string;
    email: string;
    phone?: string;
    isSupplier: boolean;
    isEnabled: boolean;

    isClient?: boolean;
    code: string;
    documentTypeReadable?: string;
    typeTradeName?: String;
    nationality?: string;
    creditLine: number;
    businessTypeId?: number;
    typeTradeId?: number;
    role?: string;
    roleReadable?: string;
    personaddressSet?: Array<ISupplierAddress>;
    checked?: boolean;
}
export interface ISupplier {
    id: number;
    documentNumber?: string;
    documentType?: string;
    names?: string;
    shortName?: string;
    address: string;

    departmentId: string;
    provinceId: string;
    districtId: string;
    countryReadable: string;
    country: string;
    economicActivityMain?: number;
    economicActivityMainReadable?: string;
    email: string;
    phone?: string;
    isSupplier: boolean;
    isEnabled: boolean;

    isClient?: boolean;
    code: string;
    documentTypeReadable?: string;
    typeTradeName?: String;
    nationality?: string;
    creditLine: number;
    businessTypeId?: number;
    typeTradeId?: number;
    role?: string;
    roleReadable?: string;
    personaddressSet?: Array<ISupplierAddress>;
    checked?: boolean;
}

export interface ISupplierAddress {
    id: number;
    districtName: string;
    provinceName: string;
    departmentName: string;
    address: string;
    latitude: number;
    longitude: number;
    pinCode: string;
    person: ISupplier;
    district: IDistrict;
}
export interface IDepartment {
    id: number;
    description: string;
}

export interface IProvince {
    id: number;
    description: string;
}

export interface IDistrict {
    id: number;
    description: string;
}

export interface ISubsidiary {
    id?: number;
    serial?: string;
    name?: string;
    address?: string;
    phone?: string;
    ubigeo?: string;
    companyId?: number;
    companyName?: string;
}

export interface IWarehouse {
    id?: number;
    name?: string;
    category?: string;
    categoryReadable?: string;
    subsidiaryId?: number;
    subsidiaryName?: string;
}

export interface ITypeAffectation {
    id?: number;
    code?: string;
    name?: string;
    affectCode?: string;
    affectName?: string;
    affectType?: string;
}

export interface IUnit {
    id?: number;
    shortName?: string;
    description?: string;
    code?: string;
}

export interface IProduct {
    id: number;
    code: string;
    ean: string;
    name: string;
    observation: string;
    activeType: string;
    stockMin: number;
    stockMax: number;
    path: string;
    classification: string;
    classificationReadable?: string;
    isCollected: boolean;
    isPurchased: boolean;
    isManufactured: boolean;
    available: boolean;
    subjectPerception: boolean;
    producttariffSet?: IProductTariff;
    totalProductTariff?: number;
    typeAffectationId?: number;
    typeAffectationName?: string;

    priceWithIgv1: number;
    priceWithoutIgv1: number;

    priceWithIgv2: number;
    priceWithoutIgv2: number;

    priceWithIgv3: number;
    priceWithoutIgv3: number;

    minimumUnitId: number;
    maximumUnitId: number;
    maximumFactor: number;
    minimumFactor: number;

    minimumUnitName?: String;
    maximumUnitName?: String;
}

export interface INationality {
    code: string;
    name: string;
}

export interface IEconomicActivity {
    code: string;
    name: string;
}

export interface IDocumentType {
    code: string;
    name: string;
}

export interface ICountry {
    code: string;
    name: string;
}

export interface IWayPay {
    code: number;
    name: string;
}

export interface IProductTariff {
    id: number;
    productId?: number;
    unitId?: number;
    priceWithIgv?: number;
    priceWithoutIgv?: number;
    quantityMinimum?: number;
    productName?: string;
    unitName?: string;
    typePrice?: string;
    factor?: string;
}

export interface IOperation {
    id?: number;
    serial?: string;
    correlative?: string;
    emitDate?: string;
    operationDate?: string;
    supplierName?: string;
    supplierId?: number;
    igvType?: number;
    documentType?: string;
    currencyType?: string;
    saleExchangeRate?: string;
    // observation?: string
    supplier?: ISupplier;
    client?: ISupplier;
    // type?: string

    operationdetailSet?: Array<IOperationDetail>;
    cashflowSet?: Array<ICashFlow>;

    discountForItem: string;
    discountGlobal: string;
    discountPercentageGlobal: string;
    totalDiscount: string;
    totalTaxed: string;
    totalUnaffected: string;
    totalExonerated: string;
    totalIgv: string;
    totalFree: string;
    totalAmount: string;
    totalPerception: string;
    totalToPay: string;

    totalPayed: string;
    operationStatus: string;
    operationStatusReadable: string;
    sendClient: boolean;
    linkXml: string;
    linkXmlLow: string;
    linkCdr: string;
    linkCdrLow: string;
    sunatStatus: boolean;
    sunatDescription: string;
    sunatDescriptionLow: string;

    // id: 0,
    // serial: "0",
    // correlative: "0",
    // emitDate: today,
    // supplierName: "",
    // supplierId: 0,
    // igvType: 18,
    // documentType: "1",
    // currencyType: "PEN",
    // saleExchangeRate: "",

    // operationdetailSet: [],
    // discountForItem: "",
    // discountGlobal: "",
    // discountPercentageGlobal: "",
    // totalDiscount: "",
    // totalTaxed: "",
    // totalUnaffected: "",
    // totalExonerated: "",
    // totalIgv: "",
    // totalFree: "",
    // totalAmount: "",
    // totalPerception: "",
    // totalToPay: "",
}

export interface ICashFlow {
    id?: number;
    temporaryId?: number;
    total?: number;
    description: string;
    wayPay: number;
}

export interface IOperationDetail {
    id?: number;
    operation?: IOperation;
    productTariff?: IProductTariff;
    price?: number;
    quantity?: number;
    subtotal?: number;
    remainingQuantity?: number;
    remainingPrice?: number;
    remainingPriceTotal?: number;
    productId?: number;
    productName?: string;
    unitValue?: number;
    unitPrice?: number;
    totalValue?: number;
    totalIgv?: number;
    totalDiscount?: number;
    temporaryId?: number;
    typeAffectationId?: number;
    productTariffId?: number;
    igvPercentage?: number;
    perceptionPercentage?: number;
    discountPercentage?: number;
    totalAmount?: number;
    totalToPay?: number;
    totalPerception?: number;
}
