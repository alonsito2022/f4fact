
export interface IUser {
    id?: number
    email?: string
    document?: string
    firstName?: string
    lastName?: string
    groups: Array<any>
    phone?: string,
    password?: string,
    repeatPassword?: string,
    role?: string,
    roleName?: string,
    fullName?: string,
    isActive?: boolean,
    avatar?: string | ArrayBuffer | null
    

}
export interface ICompany {
    id?: number
    ruc?: string
    businessName?: string
    address?: string
    phone?: string
    email?: string
    document?: string
    names?: string
    logo?: string | ArrayBuffer | null
    isProduction?: boolean
}

export interface ISubsidiary {
    id?: number
    serial?: string
    name?: string
    address?: string   
    phone?: string
    ubigeo?: string
    companyId?: number
    companyName?: string
}

export interface IWarehouse {
    id?: number
    name?: string
    category?: string
    categoryReadable?: string
    subsidiaryId?: number
    subsidiaryName?: string
}



export interface IUnit {
    id?: number
    shortName?: string
    description?: string
}

export interface IProduct {
    id: number
    code: number 
    name: string
    stockMin: number 
    stockMax: number 
    path: string
    classification: string
    classificationReadable?: string
    isCollected: boolean
    isPurchased: boolean
    isManufactured: boolean
    available: boolean
    producttariffSet?: IProductTariff
    totalProductTariff?: number
}


export interface IProductTariff {
    id: number
    productId?: number
    unitId?: number
    salePrice1?: number 
    salePrice2?: number 
    quantityMinimum?: number 
    productName?: string
    unitName?: string
}

export interface IOperation {
    id?: number
    turn?: string
    operationDate?: string
    operationType?: string
    operationTypeDisplay?: string
    operationAction?: string
    observation?: string
    user?: IUser
}

export interface IOperationDetail {
    id?: number
    operation?: IOperation
    productTariff?: IProductTariff
    price?: number
    quantity?: number
    subtotal?: number
    remainingQuantity?: number
    remainingPrice?: number
    remainingPriceTotal?: number
    batchCode?: number
    batchStock?: number
    batchPrice?: number
    batchPriceTotal?: number
}
