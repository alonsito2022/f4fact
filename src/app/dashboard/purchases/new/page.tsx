"use client";
import { useState, useEffect, useMemo, ChangeEvent, FormEvent } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { IOperation, IOperationDetail, IProduct, ISupplier, IUser } from "@/app/types";
import Search from '@/components/icons/Search';
import Add from '@/components/icons/Add';
import Edit from '@/components/icons/Edit';
import Delete from '@/components/icons/Delete';
import Save from '@/components/icons/Save';
import { Modal, ModalOptions } from 'flowbite'
import { useQuery, gql } from "@apollo/client";
import SupplierForm from "@/app/dashboard/persons/SupplierForm";
import { useSession } from 'next-auth/react'
import PurchaseDetailForm from "../PurchaseDetailForm";
import ProductForm from "../../logistics/products/ProductForm";
import WayPayForm from "../WayPayForm";
import { toast } from "react-toastify";


const today = new Date().toISOString().split('T')[0];

const initialStatePurchase = {
    id: 0,
    serial: "",
    correlative: "",
    emitDate: today,
    supplierName: "",
    supplierId: 0,
    igvType: 18,
    documentType: "01",
    currencyType: "PEN",
    saleExchangeRate: "",

    operationdetailSet: [],
    cashflowSet: [],
    discountForItem: "",
    discountGlobal: "",
    discountPercentageGlobal: "",
    totalDiscount: "",
    totalTaxed: "",
    totalUnaffected: "",
    totalExonerated: "",
    totalIgv: "",
    totalFree: "",
    totalAmount: "",
    totalPerception: "",
    totalToPay: "",
    totalPayed: "",
    totalTurned: "",
}

const initialStatePurchaseDetail = {
    id: 0,
    productId: 0,
    productName: "",

    quantity: "",

    unitValue: "",
    unitPrice: "",
    igvPercentage: "",
    discountPercentage: "",
    totalDiscount: "",
    totalValue: "",
    totalIgv: "",
    totalAmount: "",
    totalPerception: "",
    totalToPay: "",

    typeAffectationId: 0,
    productTariffId: 0,
    remainingQuantity: 0,

    temporaryId: 0,

}

const initialStatePerson = {
    id: 0,
    names: "",
    shortName: "",
    phone: "",
    email: "",
    address: "",
    country: "PE",
    countryReadable: "PERÚ",
    districtId: "040101",
    provinceId: "0401",
    departmentId: "04",
    districtName: "",
    documentType: "6",
    documentNumber: "",
    isEnabled: true,
    isSupplier: true,
    isClient: false,
    economicActivityMain: 0,
}

const initialStateProduct = {
    id: 0,
    name: "",
    code: "",

    available: true,
    activeType: "01",
    ean: "",
    weightInKilograms: 0,

    typeAffectationId: 0,
    subjectPerception: false,
    observation: "",

    priceWithIgv1: 0,
    priceWithoutIgv1: 0,

    priceWithIgv2: 0,
    priceWithoutIgv2: 0,

    priceWithIgv3: 0,
    priceWithoutIgv3: 0,

    minimumUnitId: 0,
    maximumUnitId: 0,
    maximumFactor: "1",
    minimumFactor: "1",
}

const initialStateProductFilterObj = {
    criteria: "name",
    searchText: "",
    supplierId: 0,
    lineId: 0,
    subLineId: 0,
    available: true,
    activeType: "01",
    subjectPerception: false,
    typeAffectationId: 0,
    limit: 50
}

const initialStateCashFlow = {
    wayPay: 1,
    total: 0,
    description: ""
}

const SUPPLIERS_QUERY = gql`
    query{
        allSuppliers{
            names
            id
            address
            documentNumber
        }
    }
`;

const PRODUCTS_QUERY = gql`
    query ($criteria: String!, $searchText: String!, $available: Boolean!, $activeType: String!, $subjectPerception: Boolean!, $typeAffectationId: Int!, $limit: Int!) {
        allProducts(
            criteria: $criteria
            searchText: $searchText
            available: $available
            activeType: $activeType
            subjectPerception: $subjectPerception
            typeAffectationId: $typeAffectationId
            limit: $limit
        ) {
            id
            code
            name
            available
            activeType
            activeTypeReadable
            ean
            weightInKilograms
            minimumUnitId
            maximumUnitId
            minimumUnitName
            maximumUnitName
            maximumFactor
            minimumFactor
            typeAffectationId
            typeAffectationName
            subjectPerception
            observation
        }
    }
`;

const TYPE_AFFECTATION_QUERY = gql`
    query {
        allTypeAffectations {
            id
            code
            name
            affectCode
            affectName
            affectType
        }
    }
`;

const WAY_PAY_QUERY = gql`
    query {
        allWayPays {
            code
            name
        }
    }
`;

function NewPurchasePage() {
    const [purchase, setPurchase] = useState(initialStatePurchase);
    const [product, setProduct] = useState(initialStateProduct);
    const [productFilterObj, setProductFilterObj] = useState(initialStateProductFilterObj);
    const [purchaseDetail, setPurchaseDetail] = useState(initialStatePurchaseDetail);
    const [products, setProducts] = useState<IProduct[]>([]);
    const [person, setPerson] = useState(initialStatePerson);
    const [modalAddPerson, setModalAddPerson] = useState<Modal | any>(null);
    const [modalProduct, setModalProduct] = useState<Modal | any>(null);
    const [modalAddDetail, setModalAddDetail] = useState<Modal | any>(null);
    const [modalWayPay, setModalWayPay] = useState<Modal | any>(null);
    const { data: session } = useSession();
    const [jwtToken, setJwtToken] = useState<string | null>(null);
    const [cashFlow, setCashFlow] = useState(initialStateCashFlow);

    const getAuthContext = () => ({
        headers: {
            "Content-Type": "application/json",
            "Authorization": jwtToken ? `JWT ${jwtToken}` : "",
        },
    });
    const getVariables = () => ({
        criteria: productFilterObj.criteria, searchText: productFilterObj.searchText,
        available: productFilterObj.available, activeType: productFilterObj.activeType,
        subjectPerception: productFilterObj.subjectPerception, typeAffectationId: Number(productFilterObj.typeAffectationId), limit: Number(productFilterObj.limit)
    });

    const { loading: wayPaysLoading, error: wayPaysError, data: wayPaysData } = useQuery(WAY_PAY_QUERY, {
        context: getAuthContext(),
        skip: !jwtToken,
    });

    const { loading: suppliersLoading, error: suppliersError, data: suppliersData } = useQuery(SUPPLIERS_QUERY, {
        context: getAuthContext(),
        skip: !jwtToken,
    });

    const { loading: typeAffectationsLoading, error: typeAffectationsError, data: typeAffectationsData } = useQuery(TYPE_AFFECTATION_QUERY, {
        context: getAuthContext(),
        skip: !jwtToken,
    });

    const { loading: productsLoading, error: productsError, data: productsData } = useQuery(PRODUCTS_QUERY, {
        context: getAuthContext(),
        variables: getVariables(),
        skip: !jwtToken,
    });

    const handleInputChangeEntry = (event: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;

        if (name === "supplierName" && event.target instanceof HTMLInputElement) {
            const dataList = event.target.list;
            if (dataList) {
                const option = Array.from(dataList.options).find(option => option.value === value);
                if (option) {
                    const selectedId = option.getAttribute("data-key");
                    setPurchase({ ...purchase, supplierId: Number(selectedId), supplierName: value });
                } else {
                    setPurchase({ ...purchase, supplierId: 0, supplierName: value });
                }
            } else {
                console.log('sin datalist')
            }
        } else if (name === "igvType" && event.target instanceof HTMLSelectElement) {
            setPurchase({ ...purchase, igvType: Number(value) });
        } else {
            setPurchase({ ...purchase, [name]: value });
        }


    }

    // const handleInputChangeEntryDetail = (event: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    //     const { name, value } = event.target;
    //     setPurchaseDetail({ ...purchaseDetail, [name]: value });
    // }

    const handleInputChangeProduct = (event: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        if (name === "name" && event.target instanceof HTMLInputElement) {
            const dataList = event.target.list;
            if (dataList) {
                const option = Array.from(dataList.options).find(option => option.value === value);
                if (option) {
                    const selectedId = option.getAttribute("data-key");
                    setProduct({ ...product, id: Number(selectedId), name: value });

                    modalAddDetail.show();
                    // setPurchaseDetail({
                    //     ...purchaseDetail,

                    //     id: 0,
                    //     productId: Number(selectedId),
                    //     productName: value,

                    //     quantity: "1",

                    //     unitValue: "",
                    //     unitPrice: "",
                    //     igvPercentage: "",
                    //     discountPercentage: "",
                    //     totalDiscount: "",
                    //     totalValue: "",
                    //     totalIgv: "",
                    //     totalAmount: "",
                    //     totalPerception: "",
                    //     totalToPay: "",

                    //     typeAffectationId: 0,
                    //     productTariffId: 0,
                    //     remainingQuantity: 0,
                    // });



                } else {
                    setProduct({ ...product, id: 0, name: value });
                }
            } else {
                console.log('sin datalist')
            }
        } else
            setProduct({ ...product, [name]: value });

    }

    useEffect(() => {
        if (session?.user) {
            const user = session.user as IUser;
            setJwtToken(user.accessToken as string);
        }
    }, [session]);

    useEffect(() => {
        calculateTotal();
    }, [purchase.operationdetailSet]);

    function calculateTotal() {


        // discountPercentageGlobal: 0,
        // totalFree: 0,


        const discountForItem = purchase?.operationdetailSet?.reduce((total: number, detail: IOperationDetail) => {
            return total + Number(detail.totalDiscount);
        }, 0);

        const discountGlobal = 0;
        const totalDiscount = discountForItem + discountGlobal;

        const totalUnaffected = purchase?.operationdetailSet?.filter((detail: IOperationDetail) => detail.typeAffectationId == 3).reduce((total: number, detail: IOperationDetail) => {
            return total + Number(detail.totalValue);
        }, 0);

        const totalExonerated = purchase?.operationdetailSet?.filter((detail: IOperationDetail) => detail.typeAffectationId == 2).reduce((total: number, detail: IOperationDetail) => {
            return total + Number(detail.totalValue);
        }, 0);

        const totalTaxed = purchase?.operationdetailSet?.filter((detail: IOperationDetail) => detail.typeAffectationId == 1).reduce((total: number, detail: IOperationDetail) => {
            return total + Number(detail.totalValue);
        }, 0);

        const totalIgv = purchase?.operationdetailSet?.reduce((total: number, detail: IOperationDetail) => {
            return total + Number(detail.totalIgv);
        }, 0);

        const totalAmount = totalExonerated + totalUnaffected + totalTaxed + totalIgv;
        const totalPerception = 0;
        const totalToPay = totalAmount + totalPerception;

        // quantity: "",
        // unitValue: "",
        // unitPrice: "",
        // igvPercentage: "",
        // discountPercentage: "",
        // totalDiscount: "",
        // totalValue: "",
        // totalIgv: "",
        // totalAmount: "",
        // totalPerception: "",
        // totalToPay: "",


        setPurchase((prevEntry: any) => ({
            ...prevEntry,
            discountForItem: Number(discountForItem).toFixed(2),
            discountGlobal: Number(discountGlobal).toFixed(2),
            totalDiscount: Number(totalDiscount).toFixed(2),
            totalUnaffected: Number(totalUnaffected).toFixed(2),
            totalExonerated: Number(totalExonerated).toFixed(2),
            totalTaxed: Number(totalTaxed).toFixed(2),
            totalIgv: Number(totalIgv).toFixed(2),
            totalAmount: Number(totalAmount).toFixed(2),
            totalPerception: Number(totalPerception).toFixed(2),
            totalToPay: Number(totalToPay).toFixed(2),
        }));
    }

    const handleRemovePurchaseDetail = async (indexToRemove: number) => {

        setPurchase((prevPurchase: any) => ({
            ...prevPurchase, operationdetailSet: prevPurchase?.operationdetailSet?.filter((detail: IOperationDetail) => detail.temporaryId !== indexToRemove)
        }));

    };

    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb section={"Compras"} article={"Nueva Compra"} />

                </div>
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle  lg:justify-start">
                        <div className="overflow-hidden shadow lg:max-w-4xl">

                            <div className="p-4 md:p-5 space-y-4">

                                {/* <form> */}

                                <input type="hidden" name="id" id="id" value={purchase.id} />

                                <div className="grid gap-2 grid-cols-4">

                                    <div className="sm:col-span-4">
                                        {suppliersError ? <div>Error: No autorizado o error en la consulta. {suppliersError.message}</div> :
                                            <>
                                                <label className="text-sm">Proveedor</label>
                                                <div className="relative w-full">
                                                    <input type="text" className="form-search-input-sm"
                                                        maxLength={200}
                                                        value={purchase.supplierName}
                                                        name="supplierName"
                                                        onChange={handleInputChangeEntry}
                                                        onFocus={(e) => e.target.select()}
                                                        autoComplete="off"
                                                        disabled={suppliersLoading}
                                                        placeholder="Buscar Proveedor..." list="supplierNameList" required />
                                                    <datalist id="supplierNameList">
                                                        {suppliersData?.allSuppliers?.map((n: ISupplier, index: number) => (
                                                            <option key={index} data-key={n.id} value={`${n.documentNumber} ${n.names}`} />
                                                        ))}
                                                    </datalist>
                                                    <button type="button" className="form-search-button-sm" onClick={(e) => { modalAddPerson.show(); setPerson(initialStatePerson); }}>
                                                        <Add /><span className="sr-only">Search</span>
                                                    </button>
                                                </div>
                                            </>

                                        }

                                    </div>


                                </div>
                                <div className="grid gap-2 grid-cols-4">

                                    <div className="sm:col-span-1">
                                        <label htmlFor="igvType" className="text-sm">IGV %</label>
                                        <select value={purchase.igvType} name="igvType" onChange={handleInputChangeEntry} className="form-control-sm" required>
                                            <option value={18}>18%</option>
                                            <option value={10}>10% (Ley 31556)</option>
                                            <option value={4}>4% (IVAP)</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label htmlFor="documentType" className="text-sm">Tipo documento</label>
                                        <select value={purchase.documentType} name="documentType" onChange={handleInputChangeEntry} className="form-control-sm" required>
                                            <option value={"01"}>FACTURA ELECTRÓNICA</option>
                                            <option value={"03"}>BOLETA DE VENTA ELECTRÓNICA</option>
                                            <option value={"07"}>NOTA DE CRÉDITO ELECTRÓNICA</option>
                                            <option value={"08"}>NOTA DE DÉBITO ELECTRÓNICA</option>
                                            <option value={"09"}>GUIA DE REMISIÓN REMITENTE</option>
                                        </select>
                                    </div>


                                    <div className="sm:col-span-1">
                                        <label htmlFor="emitDate" className="text-sm">Fecha emisión</label>
                                        <input type="date"
                                            name="emitDate"
                                            id="emitDate"
                                            value={purchase.emitDate}
                                            onChange={handleInputChangeEntry}
                                            onFocus={(e) => e.target.select()}
                                            className="form-control-sm"
                                            required
                                        />
                                    </div>

                                </div>
                                <div className="grid gap-2 grid-cols-4">

                                    <div className="sm:col-span-1">
                                        <label htmlFor="currencyType" className="text-sm">Moneda</label>
                                        <select value={purchase.currencyType} name="currencyType" onChange={handleInputChangeEntry} className="form-control-sm">
                                            <option value={0} disabled>Moneda</option>
                                            <option value={"PEN"}>S/ PEN - SOLES</option>
                                            <option value={"USD"}>US$ USD - DÓLARES AMERICANOS</option>
                                            <option value={"EUR"}>€ EUR - EUROS</option>
                                            <option value={"GBP"}>£ GBP - LIBRA ESTERLINA</option>
                                        </select>
                                    </div>


                                    <div className="sm:col-span-1">
                                        <label htmlFor="saleExchangeRate" className="text-sm">Tipo de cambio</label>
                                        <input type="text"
                                            name="saleExchangeRate"
                                            id="saleExchangeRate"
                                            maxLength={10}
                                            value={purchase.saleExchangeRate}
                                            onChange={handleInputChangeEntry}
                                            onFocus={(e) => e.target.select()}
                                            className="form-control-sm"

                                            autoComplete="off"
                                        />
                                    </div>

                                    <div className="sm:col-span-1">
                                        <label htmlFor="serial" className="text-sm">Serie</label>
                                        <input type="text"
                                            name="serial"
                                            id="serial"
                                            maxLength={6}
                                            value={purchase.serial}
                                            onChange={handleInputChangeEntry}
                                            onFocus={(e) => e.target.select()}
                                            className="form-control-sm"

                                            autoComplete="off"
                                        />
                                    </div>

                                    <div className="sm:col-span-1">
                                        <label htmlFor="correlative" className="text-sm">Numero</label>
                                        <input type="text"
                                            name="correlative"
                                            id="correlative"
                                            maxLength={10}
                                            value={purchase.correlative}
                                            onChange={handleInputChangeEntry}
                                            onFocus={(e) => e.target.select()}
                                            className="form-control-sm"

                                            autoComplete="off"
                                        />
                                    </div>

                                </div>
                                <div className="grid gap-2 grid-cols-4">

                                    <div className="sm:col-span-4">
                                        <label className="text-sm">Buscar Producto o Servicio</label>
                                        <div className="relative w-full">
                                            <input type="text" className="form-search-input-sm"
                                                maxLength={100}
                                                value={product.name}
                                                name="name"
                                                onChange={handleInputChangeProduct}
                                                onFocus={(e) => e.target.select()}
                                                autoComplete="off"
                                                disabled={productsLoading}
                                                placeholder="Buscar Producto..." list="productNameList" required />
                                            <datalist id="productNameList">
                                                {productsData?.allProducts?.map((n: IProduct, index: number) => (
                                                    <option key={index} data-key={n.id} value={n.name} />
                                                ))}
                                            </datalist>
                                            <button type="button" className="form-search-button-sm" onClick={(e) => { modalProduct.show(); setProduct(initialStateProduct); }}>
                                                <Add />
                                            </button>
                                        </div>
                                    </div>

                                </div>
                                <div className="flex justify-end py-2">
                                    <button type="button" className="btn-blue px-5 py-2 inline-flex items-center gap-2 " onClick={(e) => {
                                        modalAddDetail.show(); setPurchaseDetail(initialStatePurchaseDetail);
                                    }}><Add /> AGREGAR ITEM
                                    </button>
                                </div>


                                <div className="overflow-hidden shadow">
                                    <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                                        <thead className="bg-gray-100 dark:bg-gray-700">
                                            <tr>
                                                <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Descripción</th>
                                                <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Cantidad</th>
                                                <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">C/U</th>
                                                <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Subtotal</th>
                                                <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {purchase?.operationdetailSet?.map((item: any, i: number) =>
                                                <tr key={i} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                    <td className="px-4 py-2">{item.productName}</td>
                                                    <td className="px-4 py-2">{item.quantity}</td>
                                                    <td className="px-4 py-2">{item.unitValue}</td>
                                                    <td className="px-4 py-2">{item.totalValue}</td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex justify-end py-2">

                                                            <a className="hover:underline cursor-pointer" onClick={(e) => {
                                                                modalAddDetail.show(); setPurchaseDetail(item);
                                                                setProduct({ ...product, id: Number(item.productId), name: item.productName });
                                                            }}>
                                                                <Edit />
                                                            </a>

                                                            <a className="hover:underline cursor-pointer" onClick={() => handleRemovePurchaseDetail(Number(item?.temporaryId))}>
                                                                <Delete />
                                                            </a>

                                                        </div>

                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="grid grid-cols-4">
                                    <div className="sm:col-span-3 text-right">% Descuento Global</div><div className="sm:col-span-1 text-right">0</div>
                                    <div className="sm:col-span-3 text-right">Descuento Global (-) {purchase.currencyType === "PEN" ? "S/" : purchase.currencyType === "USD" ? "US$" : purchase.currencyType === "EUR" ? "€" : purchase.currencyType === "GBP" ? "£" : null}</div><div className="sm:col-span-1 text-right">{purchase.discountGlobal}</div>
                                    <div className="sm:col-span-3 text-right">Descuento por Item (-) {purchase.currencyType === "PEN" ? "S/" : purchase.currencyType === "USD" ? "US$" : purchase.currencyType === "EUR" ? "€" : purchase.currencyType === "GBP" ? "£" : null}</div><div className="sm:col-span-1 text-right">{purchase.discountForItem}</div>
                                    <div className="sm:col-span-3 text-right">Descuento Total (-) {purchase.currencyType === "PEN" ? "S/" : purchase.currencyType === "USD" ? "US$" : purchase.currencyType === "EUR" ? "€" : purchase.currencyType === "GBP" ? "£" : null}</div><div className="sm:col-span-1 text-right">{purchase.totalDiscount}</div>
                                    <div className="sm:col-span-3 text-right">Exonerada {purchase.currencyType === "PEN" ? "S/" : purchase.currencyType === "USD" ? "US$" : purchase.currencyType === "EUR" ? "€" : purchase.currencyType === "GBP" ? "£" : null}</div><div className="sm:col-span-1 text-right">{purchase.totalExonerated || "0.00"}</div>
                                    <div className="sm:col-span-3 text-right">Inafecta {purchase.currencyType === "PEN" ? "S/" : purchase.currencyType === "USD" ? "US$" : purchase.currencyType === "EUR" ? "€" : purchase.currencyType === "GBP" ? "£" : null}</div><div className="sm:col-span-1 text-right">{purchase.totalUnaffected || "0.00"}</div>
                                    <div className="sm:col-span-3 text-right">Gravada {purchase.currencyType === "PEN" ? "S/" : purchase.currencyType === "USD" ? "US$" : purchase.currencyType === "EUR" ? "€" : purchase.currencyType === "GBP" ? "£" : null}</div><div className="sm:col-span-1 text-right">{purchase.totalTaxed}</div>
                                    <div className="sm:col-span-3 text-right">IGV {purchase.currencyType === "PEN" ? "S/" : purchase.currencyType === "USD" ? "US$" : purchase.currencyType === "EUR" ? "€" : purchase.currencyType === "GBP" ? "£" : null}</div><div className="sm:col-span-1 text-right">{purchase.totalIgv}</div>
                                    <div className="sm:col-span-3 text-right">Gratuita {purchase.currencyType === "PEN" ? "S/" : purchase.currencyType === "USD" ? "US$" : purchase.currencyType === "EUR" ? "€" : purchase.currencyType === "GBP" ? "£" : null}</div><div className="sm:col-span-1 text-right">{purchase.totalFree || "0.00"}</div>
                                    <div className="sm:col-span-3 text-right">Otros Cargos {purchase.currencyType === "PEN" ? "S/" : purchase.currencyType === "USD" ? "US$" : purchase.currencyType === "EUR" ? "€" : purchase.currencyType === "GBP" ? "£" : null}</div><div className="sm:col-span-1 text-right">0.00</div>
                                    <div className="sm:col-span-3 text-right">Total {purchase.currencyType === "PEN" ? "S/" : purchase.currencyType === "USD" ? "US$" : purchase.currencyType === "EUR" ? "€" : purchase.currencyType === "GBP" ? "£" : null}</div><div className="sm:col-span-1 text-right">{purchase.totalAmount}</div>
                                </div>
                                <div className="flex justify-end py-2">
                                    <button type="button"
                                        className={`btn-blue px-5 py-2 inline-flex items-center gap-2 ${purchase?.operationdetailSet?.length === 0 ? "cursor-not-allowed" : ""}`}
                                        onClick={async () => {
                                            if (Number(purchase.supplierId) === 0) { toast('Por favor ingrese un proveedor.', { hideProgressBar: true, autoClose: 2000, type: 'warning' }); return; }
                                            if (purchase.serial.length === 0) { toast('Por favor ingrese una serie.', { hideProgressBar: true, autoClose: 2000, type: 'warning' }); return; }
                                            if (Number(purchase.correlative) === 0) { toast('Por favor ingrese un correlativo.', { hideProgressBar: true, autoClose: 2000, type: 'warning' }); return; }
                                            if (purchase.operationdetailSet.length === 0) { toast('Por favor ingrese al menos un item.', { hideProgressBar: true, autoClose: 2000, type: 'warning' }); return; }
                                            modalWayPay.show();
                                            setPurchase({ ...purchase, totalPayed: "", cashflowSet: [] })
                                            setCashFlow({ ...cashFlow, total: Number(purchase.totalToPay) });
                                        }} disabled={purchase?.operationdetailSet?.length === 0}><Save />CONTINUAR CON EL PAGO
                                    </button>
                                </div>

                                {/* </form> */}




                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <SupplierForm modalAddPerson={modalAddPerson} setModalAddPerson={setModalAddPerson} person={person} setPerson={setPerson} jwtToken={jwtToken} SUPPLIERS_QUERY={SUPPLIERS_QUERY} purchase={purchase} setPurchase={setPurchase} />
            <ProductForm modalProduct={modalProduct} setModalProduct={setModalProduct} product={product} setProduct={setProduct} jwtToken={jwtToken} initialStateProduct={initialStateProduct} typeAffectationsData={typeAffectationsData} PRODUCTS_QUERY={PRODUCTS_QUERY} productFilterObj={productFilterObj} />
            <PurchaseDetailForm modalAddDetail={modalAddDetail} setModalAddDetail={setModalAddDetail} product={product} setProduct={setProduct} purchaseDetail={purchaseDetail} setPurchaseDetail={setPurchaseDetail} purchase={purchase} setPurchase={setPurchase}
                jwtToken={jwtToken} initialStateProduct={initialStateProduct} initialStatePurchaseDetail={initialStatePurchaseDetail} typeAffectationsData={typeAffectationsData} productsData={productsData} />
            <WayPayForm modalWayPay={modalWayPay} setModalWayPay={setModalWayPay} cashFlow={cashFlow} setCashFlow={setCashFlow} initialStateCashFlow={initialStateCashFlow} initialStatePurchase={initialStatePurchase} purchase={purchase} setPurchase={setPurchase} jwtToken={jwtToken} wayPaysData={wayPaysData} />
        </>
    )
}

export default NewPurchasePage
