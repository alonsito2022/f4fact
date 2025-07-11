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
    subsidiarySerial?: string;
    subsidiary?: ISubsidiary;
    isActive?: boolean;
    isSuperuser?: boolean;
    avatar?: string | ArrayBuffer | null;
    avatarUrl?: string;
    refreshToken?: string;
    accessToken?: string;
    exp?: number;
    origIat?: number;
    companyId?: number;
    companyName?: string;
    companyDoc?: string;
    companyPercentageIgv?: number;
    companyIsEnabled?: boolean;
    companyIncludeIgv: boolean;
    companyWithStock: boolean;
    companyInvoiceF: boolean;
    companyInvoiceB: boolean;
    companyGuide: boolean;
    companyCatalog: boolean;
    companyApp: boolean;
    companyDisableContinuePay: boolean;
    companyIsProduction: boolean;
    mobileDescription: string;
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
    guideClientId?: string;
    guideClientSecret?: string;
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
    ose?: boolean;
    disableContinuePay?: boolean;
    deductionAccount?: String;
    registerDate?: string;
    isRus?: boolean;
    isAgentRetention?: boolean;
    isAgentPerception?: boolean;
}
export interface IVehicle {
    id: number;
    index: number;
    typeVehicle?: string;
    licensePlate?: string;
    company?: ICompany;
    capacity?: number;
}
export interface IPerson {
    id?: number;
    index?: number;
    documentNumber?: string;
    documentType?: string;
    names?: string;
    shortName?: string;
    address?: string;

    departmentId?: string;
    provinceId?: string;
    districtId?: string;
    countryReadable?: string;
    country?: string;
    economicActivityMain?: number;
    economicActivityMainReadable?: string;
    email?: string;
    phone?: string;
    isSupplier?: boolean;
    isEnabled?: boolean;

    isClient?: boolean;
    code?: string;
    documentTypeReadable?: string;
    typeTradeName?: String;
    nationality?: string;
    creditLine?: number;
    businessTypeId?: number;
    typeTradeId?: number;
    role?: string;
    roleReadable?: string;
    personaddressSet?: Array<ISupplierAddress>;
    checked?: boolean;

    driverLicense?: string;

    mainDriverDocumentType?: string;
    mainDriverDocumentNumber?: string;
    mainDriverNames?: string;
    mainDriverDriverLicense?: string;
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

export interface ISerialAssigned {
    id: number;
    documentType: string;
    serial: string;
    isGeneratedViaApi: boolean;
}

export interface ISubsidiary {
    id?: number;
    serial?: string;
    name?: string;
    address?: string;
    phone?: string;
    districtId?: string;
    companyId?: number;
    companyName?: string;
    company?: ICompany;

    districtDescription?: string;
    provinceDescription?: string;
    departmentDescription?: string;
    token?: string;

    pdfFormatForInvoices?: string;
    pdfFormatForReceiptInvoices?: string;
    pdfFormatForGuides?: string;
    fillColor?: string;
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
    barcode: string;
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

    priceWithIgv4: number;
    priceWithoutIgv4: number;
    stock: number;

    minimumUnitId: number;
    maximumUnitId: number;
    maximumFactor: number;
    minimumFactor: number;

    minimumUnitName?: String;
    maximumUnitName?: String;

    subsidiary?: ISubsidiary;
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

export interface ICreditNoteType {
    code: number;
    name: string;
}

export interface IGuideModeType {
    code: number;
    name: string;
}

export interface IGuideReasonType {
    code: number;
    name: string;
}

export interface IOperationType {
    code: string;
    name: string;
}

export interface IPerceptionType {
    code: number;
    name: string;
}

export interface IRetentionType {
    code: number;
    name: string;
    rate?: number;
}

export interface IDetractionType {
    code: number;
    name: string;
}

export interface IDetractionPaymentMethod {
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
    id: number;
    serial: string;
    correlative: string;
    emitDate: string;
    emitTime: string;
    operationType: string;
    operationDate: string;
    supplierName: string;
    supplierId: number;
    supplierDocumentType: string;
    igvType: number;
    documentType: string;
    documentTypeReadable: string;
    currencyType: string;
    saleExchangeRate: string;
    // observation?: string
    supplier: ISupplier;
    client: ISupplier;
    // type?: string
    subsidiary: ISubsidiary;
    operationdetailSet: Array<IOperationDetail>;
    relatedDocuments: Array<IRelatedDocument>;
    cashflowSet: Array<ICashFlow>;
    nextTemporaryId?: number;

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
    sendWhatsapp: boolean;
    linkXml: string;
    linkXmlLow: string;
    linkCdr: string;
    linkCdrLow: string;
    fileNameXml: string;
    fileNameCdr: string;
    codeHash: string;
    sunatStatus: boolean;
    sendSunat: boolean;
    sunatDescription: string;
    sunatDescriptionLow: string;

    creditNoteReferences: string;

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
    // Add these required properties that are missing from your interface
    dueDate: string;
    clientName: string;
    clientDocumentType: string;
    clientId: number;
    detractionPercentage: string;
    user: IUser;
}

export interface ICashFlow {
    id?: number;
    temporaryId?: number;
    total?: number;
    description: string;
    transactionDate: string;
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
    index?: number;
    productId?: number;
    productName?: string;
    description?: string;
    unitValue?: number;
    unitPrice?: number;
    totalValue?: number;
    totalIgv?: number;
    totalDiscount?: number;
    quantityReturned?: number; // for credit note
    quantityAvailable?: number; // for credit note
    temporaryId?: number; // for credit note
    typeAffectationId?: number;
    productTariffId?: number;
    igvPercentage?: number;
    perceptionPercentage?: number;
    retentionPercentage?: number;
    detractionPercentage?: number;
    discountPercentage?: number;
    totalAmount?: number;
    totalToPay?: number;
    totalPerception?: number;
    totalRetention?: number;
    totalDetraction?: number;
    perceptionType?: number;
    retentionType?: number;
    detractionType?: number;
}

export interface IQuota {
    id?: number;
    temporaryId?: number;
    paymentDate?: string;
    number?: number;
    total?: number;
}

export interface IRelatedDocument {
    temporaryId?: number;
    id?: number;
    index?: number;
    documentType?: string;
    serial?: string;
    correlative?: number;
    emitDate?: string;
    currencyDateChange?: string;
    currencyType?: string;
    saleExchangeRate?: string;
    totalAmount?: number;

    retentionType?: number;
    totalRetention?: number;
    retentionDate?: string;
    quotas?: Array<IQuota>;
}
