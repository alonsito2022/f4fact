"use client";
import { useState, useEffect, useMemo, ChangeEvent, FormEvent } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { useSession } from 'next-auth/react'
import { Modal, ModalOptions } from 'flowbite'
import { useQuery, gql } from "@apollo/client";
import { IPerson } from "@/app/types";
import Search from '@/components/icons/Search';
import Add from '@/components/icons/Add';
import Edit from '@/components/icons/Edit';
import Delete from '@/components/icons/Delete';
import Save from '@/components/icons/Save';
const today = new Date().toISOString().split('T')[0];
const initialStateSale = {
    id: 0,
    serial: "",
    correlative: "",
    emitDate: today,
    clientName: "",
    clientId: 0,
    igvType: 18,
    documentType: "01",
    currencyType: "PEN",
    saleExchangeRate: "",
    userId: 0,
    userName: "",
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
const CLIENTS_QUERY = gql`
    query{
        allClients{
            names
            id
            address
            documentNumber
        }
    }
`;
function NewSalePage() {
    const [sale, setSale] = useState(initialStateSale);
    const [person, setPerson] = useState(initialStatePerson);
    const { data: session } = useSession();
    const [jwtToken, setJwtToken] = useState<string | null>(null);
    const [modalPerson, setModalPerson] = useState<Modal | any>(null);
    const getAuthContext = () => ({
        headers: {
            "Content-Type": "application/json",
            "Authorization": jwtToken ? `JWT ${jwtToken}` : "",
        },
    });
    const { loading: personsLoading, error: personsError, data: personsData } = useQuery(CLIENTS_QUERY, {
        context: getAuthContext(),
        skip: !jwtToken,
    });
    const handleSale = (event: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
    }
    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb section={"Ventas"} article={"Nueva Venta"} />

                </div>
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow lg:max-w-4xl">

                            <div className="p-4 md:p-5 space-y-4">

                                {/* <form> */}

                                <input type="hidden" name="id" id="id" value={sale.id} />

                                <div className="grid gap-2 grid-cols-4">

                                    <div className="sm:col-span-4">
                                        {personsError ? <div>Error: No autorizado o error en la consulta. {personsError.message}</div> :
                                            <>
                                                <label className="text-sm">Proveedor</label>
                                                <div className="relative w-full">
                                                    <input type="text" className="form-search-input-sm"
                                                        maxLength={200}
                                                        value={sale.clientName}
                                                        name="clientName"
                                                        onChange={handleSale}
                                                        onFocus={(e) => e.target.select()}
                                                        autoComplete="off"
                                                        disabled={personsLoading}
                                                        placeholder="Buscar cliente..." list="clientNameList" required />
                                                    <datalist id="clientNameList">
                                                        {personsData?.allClients?.map((n: IPerson, index: number) => (
                                                            <option key={index} data-key={n.id} value={`${n.documentNumber} ${n.names}`} />
                                                        ))}
                                                    </datalist>
                                                    <button type="button" className="form-search-button-sm" onClick={(e) => { modalPerson.show(); setPerson(initialStatePerson); }}>
                                                        <Add /><span className="sr-only">Search</span>
                                                    </button>
                                                </div>
                                            </>

                                        }

                                    </div>


                                </div>
                                {/* <div className="grid gap-2 grid-cols-4">

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
                                </div> */}

                                {/* </form> */}




                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NewSalePage
