"use client";
import { useState, useEffect, useMemo, ChangeEvent, FormEvent } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { IProduct, ISupplier, IUser } from "@/app/types";
import Search from '@/components/icons/Search';
import Add from '@/components/icons/Add';
import Save from '@/components/icons/Save';
import { Modal, ModalOptions } from 'flowbite'
import { useQuery, gql } from "@apollo/client";
import PersonForm from "@/app/dashboard/persons/PersonForm";
import { useSession } from 'next-auth/react'
import PurchaseDetailForm from "../PurchaseDetailForm";
import ProductForm from "../../logistics/products/ProductForm";


const today = new Date().toISOString().split('T')[0];

const initialStatePurchase = {
    id: 0,
    serial: "0",
    correlative: "0",
    emitDate: today,
    supplierName: "",
    supplierId: 0,
    igvType: 18,
    documentType: "1",
    currencyType: "PEN",
    saleExchangeRate: "",
}

const initialStatePurchaseDetail = {
    id: 0,
    productEan: "",
    productCode: "",
    unitName: "",
    unitMinName: "",
    maximumFactor: 0,
    productName: "",
    productTariffId: 0,
    oldPrice: 0,
    quantity: "",
    newPrice: "",
    subtotal: "",
    temporaryId: 0,
    expireDate: today,
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

const PEOPLE_QUERY = gql`
    query{
        allSuppliers{
            names
            id
            address
            documentNumber
        }
    }
`;

function NewPurchasePage() {
    const [purchase, setPurchase] = useState(initialStatePurchase);
    const [product, setProduct] = useState(initialStateProduct);
    const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
    const [purchaseDetail, setPurchaseDetail] = useState(initialStatePurchaseDetail);
    const [products, setProducts] = useState<IProduct[]>([]);
    const [person, setPerson] = useState(initialStatePerson);
    const [modalAddPerson, setModalAddPerson] = useState<Modal | any>(null);
    const [modalProduct, setModalProduct] = useState<Modal | any>(null);
    const [modalAddDetail, setModalAddDetail] = useState<Modal | any>(null);
    const { data: session } = useSession();
    const [jwtToken, setJwtToken] = useState<string | null>(null);

    const getAuthContext = () => ({
        headers: {
            "Content-Type": "application/json",
            "Authorization": jwtToken ? `JWT ${jwtToken}` : "",
        },
    });

    const { loading: peopleLoading, error: peopleError, data: peopleData } = useQuery(PEOPLE_QUERY, {
        context: getAuthContext(),
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

    const handleInputChangeEntryDetail = (event: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setPurchaseDetail({ ...purchaseDetail, [name]: value });
    }

    useEffect(() => {
        if (session?.user) {
            const user = session.user as IUser;
            setJwtToken(user.accessToken as string);
        }
    }, [session]);
    const handleSavePurchase = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("purchase", purchase)
    }
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

                                <form onSubmit={handleSavePurchase}>

                                    <input type="hidden" name="id" id="id" value={purchase.id} />

                                    <div className="grid gap-2 grid-cols-4">
                                        peopleError

                                        <div className="sm:col-span-4">
                                            {peopleError ? <div>Error: No autorizado o error en la consulta. {peopleError.message}</div> :
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
                                                            disabled={peopleLoading}
                                                            placeholder="Buscar Proveedor..." list="supplierNameList" required />
                                                        <datalist id="supplierNameList">
                                                            {peopleData?.allSuppliers?.map((n: ISupplier, index: number) => (
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
                                                value={purchase.serial || ""}
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
                                            <label htmlFor="productName" className="text-sm">Buscar Producto o Servicio</label>
                                            <div className="relative w-full">
                                                <input type="search" className="form-search-input-sm"
                                                    maxLength={100}
                                                    value={purchaseDetail.productName}
                                                    name="productName"
                                                    onChange={handleInputChangeEntryDetail}
                                                    onFocus={(e) => e.target.select()}
                                                    autoComplete="off"
                                                    placeholder="Buscar Producto..." list="productNameList" required />
                                                <datalist id="productNameList">
                                                    {products?.map((n: IProduct, index: number) => (
                                                        <option key={index} data-key={n.id} value={n.name} data-ean={n.ean ? n.ean : ""} data-unit-min-name={n.minimumUnitName} data-max-factor={n.maximumFactor} />
                                                    ))}
                                                </datalist>
                                                <button type="button" className="form-search-button-sm" onClick={(e) => { modalProduct.show(); setPurchaseDetail(initialStatePurchaseDetail); }}>
                                                    <Add />
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="flex justify-end py-2">
                                        <button type="button" className="btn-blue px-5 py-2 inline-flex items-center gap-2 " onClick={(e) => { modalAddDetail.show(); setPurchaseDetail(initialStatePurchaseDetail); }}>
                                            <Add /> AGREGAR ITEM
                                        </button>
                                    </div>


                                    <div className="grid grid-cols-4">
                                        <div className="sm:col-span-3 text-right">% Descuento Global</div><div className="sm:col-span-1 text-right">0</div>

                                        <div className="sm:col-span-3 text-right">Descuento Global (-) {purchase.currencyType === "PEN" ? "S/" : purchase.currencyType === "USD" ? "US$" : purchase.currencyType === "EUR" ? "€" : purchase.currencyType === "GBP" ? "£" : null}</div><div className="sm:col-span-1 text-right">00.00</div>

                                        <div className="sm:col-span-3 text-right">Descuento por Item (-) {purchase.currencyType === "PEN" ? "S/" : purchase.currencyType === "USD" ? "US$" : purchase.currencyType === "EUR" ? "€" : purchase.currencyType === "GBP" ? "£" : null}</div><div className="sm:col-span-1 text-right">00.00</div>

                                        <div className="sm:col-span-3 text-right">Descuento Total (-) {purchase.currencyType === "PEN" ? "S/" : purchase.currencyType === "USD" ? "US$" : purchase.currencyType === "EUR" ? "€" : purchase.currencyType === "GBP" ? "£" : null}</div><div className="sm:col-span-1 text-right">00.00</div>

                                        <div className="sm:col-span-3 text-right">Exonerada {purchase.currencyType === "PEN" ? "S/" : purchase.currencyType === "USD" ? "US$" : purchase.currencyType === "EUR" ? "€" : purchase.currencyType === "GBP" ? "£" : null}</div><div className="sm:col-span-1 text-right">00.00</div>

                                        <div className="sm:col-span-3 text-right">Inafecta {purchase.currencyType === "PEN" ? "S/" : purchase.currencyType === "USD" ? "US$" : purchase.currencyType === "EUR" ? "€" : purchase.currencyType === "GBP" ? "£" : null}</div><div className="sm:col-span-1 text-right">00.00</div>

                                        <div className="sm:col-span-3 text-right">IGV {purchase.currencyType === "PEN" ? "S/" : purchase.currencyType === "USD" ? "US$" : purchase.currencyType === "EUR" ? "€" : purchase.currencyType === "GBP" ? "£" : null}</div><div className="sm:col-span-1 text-right">00.00</div>

                                        <div className="sm:col-span-3 text-right">Gratuita {purchase.currencyType === "PEN" ? "S/" : purchase.currencyType === "USD" ? "US$" : purchase.currencyType === "EUR" ? "€" : purchase.currencyType === "GBP" ? "£" : null}</div><div className="sm:col-span-1 text-right">00.00</div>

                                        <div className="sm:col-span-3 text-right">Otros Cargos {purchase.currencyType === "PEN" ? "S/" : purchase.currencyType === "USD" ? "US$" : purchase.currencyType === "EUR" ? "€" : purchase.currencyType === "GBP" ? "£" : null}</div><div className="sm:col-span-1 text-right">00.00</div>

                                        <div className="sm:col-span-3 text-right">Total {purchase.currencyType === "PEN" ? "S/" : purchase.currencyType === "USD" ? "US$" : purchase.currencyType === "EUR" ? "€" : purchase.currencyType === "GBP" ? "£" : null}</div><div className="sm:col-span-1 text-right">00.00</div>


                                    </div>
                                    <div className="flex justify-end py-2">
                                        <button type="submit" className="btn-green px-5 py-2 inline-flex items-center gap-2">
                                            <Save />CONTINUAR CON EL PAGO
                                        </button></div>

                                </form>




                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <PurchaseDetailForm modalAddDetail={modalAddDetail} setModalAddDetail={setModalAddDetail} purchaseDetail={purchaseDetail} />
            <PersonForm modalAddPerson={modalAddPerson} setModalAddPerson={setModalAddPerson} person={person} setPerson={setPerson} jwtToken={jwtToken} 
            PEOPLE_QUERY={PEOPLE_QUERY} purchase={purchase} setPurchase={setPurchase} />
            <ProductForm modalProduct={modalProduct} setModalProduct={setModalProduct} product={product} setProduct={setProduct} initialStateProduct={initialStateProduct}  />
        </>
    )
}

export default NewPurchasePage
