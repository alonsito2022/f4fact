"use client";
import { useState, useEffect, useMemo, ChangeEvent, FormEvent } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { useSession } from "next-auth/react";
import { Modal, ModalOptions } from "flowbite";
import { useQuery, gql } from "@apollo/client";
import { IOperationDetail, IPerson, IProduct, IUser } from "@/app/types";
import Search from "@/components/icons/Search";
import Add from "@/components/icons/Add";
import Edit from "@/components/icons/Edit";
import Delete from "@/components/icons/Delete";
import Save from "@/components/icons/Save";
import ProductForm from "../../logistics/products/ProductForm";
import { toast } from "react-toastify";
import SaleDetailForm from "../SaleDetailForm";
import WayPayForm from "../WayPayForm";
const today = new Date().toISOString().split("T")[0];

const CLIENTS_QUERY = gql`
    query {
        allClients {
            names
            id
            address
            documentNumber
        }
    }
`;
const PRODUCTS_QUERY = gql`
    query ($subsidiaryId: Int!) {
        allProducts(subsidiaryId: $subsidiaryId) {
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
};
const initialStateSaleDetail = {
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
};
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
};
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
};
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
    limit: 50,
};
const initialStateCashFlow = {
    wayPay: 1,
    total: 0,
    description: "",
};
const initialStateUserLogged = {
    id: 0,
    subsidiaryId: "",
    isSuperuser: false,
};
function NewSalePage() {
    const [sale, setSale] = useState(initialStateSale);
    const [saleDetail, setSaleDetail] = useState(initialStateSaleDetail);
    const [person, setPerson] = useState(initialStatePerson);
    const { data: session } = useSession();
    const [jwtToken, setJwtToken] = useState<string | null>(null);
    const [modalPerson, setModalPerson] = useState<Modal | any>(null);
    const [product, setProduct] = useState(initialStateProduct);
    const [userLogged, setUserLogged] = useState(initialStateUserLogged);
    const [productFilterObj, setProductFilterObj] = useState(
        initialStateProductFilterObj
    );
    const [cashFlow, setCashFlow] = useState(initialStateCashFlow);
    const [modalAddPerson, setModalAddPerson] = useState<Modal | any>(null);
    const [modalProduct, setModalProduct] = useState<Modal | any>(null);
    const [modalAddDetail, setModalAddDetail] = useState<Modal | any>(null);
    const [modalWayPay, setModalWayPay] = useState<Modal | any>(null);
    useEffect(() => {
        if (session?.user) {
            const user = session.user as IUser;
            setJwtToken((prev) => prev || (user.accessToken as string)); // Solo cambia si es null
            setUserLogged((prev) => ({
                ...prev,
                subsidiaryId:
                    prev.subsidiaryId ||
                    (user.isSuperuser ? "0" : user.subsidiaryId!),
                isSuperuser: user.isSuperuser ?? false, // Asegura que isSuperuser sea siempre booleano
            }));
            console.log(user.isSuperuser ? "0" : user.subsidiaryId!);
        }
    }, [session]);

    const authContext = useMemo(
        () => ({
            headers: {
                "Content-Type": "application/json",
                Authorization: jwtToken ? `JWT ${jwtToken}` : "",
            },
        }),
        [jwtToken]
    );

    const getVariables = () => ({
        subsidiaryId: Number(userLogged.subsidiaryId),
    });
    const {
        loading: personsLoading,
        error: personsError,
        data: personsData,
    } = useQuery(CLIENTS_QUERY, {
        context: authContext,
        skip: !jwtToken,
    });
    const {
        loading: productsLoading,
        error: productsError,
        data: productsData,
    } = useQuery(PRODUCTS_QUERY, {
        context: authContext,
        variables: getVariables(),
        skip: !jwtToken,
    });
    const {
        loading: typeAffectationsLoading,
        error: typeAffectationsError,
        data: typeAffectationsData,
    } = useQuery(TYPE_AFFECTATION_QUERY, {
        context: authContext,
        skip: !jwtToken,
    });
    const {
        loading: wayPaysLoading,
        error: wayPaysError,
        data: wayPaysData,
    } = useQuery(WAY_PAY_QUERY, {
        context: authContext,
        skip: !jwtToken,
    });
    const handleSale = (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;
    };
    const handleProduct = (
        event: ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;
        if (name === "name" && event.target instanceof HTMLInputElement) {
            const dataList = event.target.list;
            if (dataList) {
                const option = Array.from(dataList.options).find(
                    (option) => option.value === value
                );
                if (option) {
                    const selectedId = option.getAttribute("data-key");
                    setProduct({
                        ...product,
                        id: Number(selectedId),
                        name: value,
                    });

                    // modalAddDetail.show();
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
                console.log("sin datalist");
            }
        } else setProduct({ ...product, [name]: value });
    };
    const handleRemoveSaleDetail = async (indexToRemove: number) => {
        setSale((prevPurchase: any) => ({
            ...prevPurchase,
            operationdetailSet: prevPurchase?.operationdetailSet?.filter(
                (detail: IOperationDetail) =>
                    detail.temporaryId !== indexToRemove
            ),
        }));
    };
    useEffect(() => {
        if (session?.user) {
            const user = session.user as IUser;
            setJwtToken(user.accessToken as string);
        }
    }, [session]);

    useEffect(() => {
        calculateTotal();
    }, [sale.operationdetailSet]);

    function calculateTotal() {
        const discountForItem = sale?.operationdetailSet?.reduce(
            (total: number, detail: IOperationDetail) => {
                return total + Number(detail.totalDiscount);
            },
            0
        );

        const discountGlobal = 0;
        const totalDiscount = discountForItem + discountGlobal;

        const totalUnaffected = sale?.operationdetailSet
            ?.filter(
                (detail: IOperationDetail) => detail.typeAffectationId == 3
            )
            .reduce((total: number, detail: IOperationDetail) => {
                return total + Number(detail.totalValue);
            }, 0);

        const totalExonerated = sale?.operationdetailSet
            ?.filter(
                (detail: IOperationDetail) => detail.typeAffectationId == 2
            )
            .reduce((total: number, detail: IOperationDetail) => {
                return total + Number(detail.totalValue);
            }, 0);

        const totalTaxed = sale?.operationdetailSet
            ?.filter(
                (detail: IOperationDetail) => detail.typeAffectationId == 1
            )
            .reduce((total: number, detail: IOperationDetail) => {
                return total + Number(detail.totalValue);
            }, 0);

        const totalIgv = sale?.operationdetailSet?.reduce(
            (total: number, detail: IOperationDetail) => {
                return total + Number(detail.totalIgv);
            },
            0
        );

        const totalAmount =
            totalExonerated + totalUnaffected + totalTaxed + totalIgv;
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

        setSale((prevEntry: any) => ({
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

                                <input
                                    type="hidden"
                                    name="id"
                                    id="id"
                                    value={sale.id}
                                />
                                <div className="grid gap-2 grid-cols-4">
                                    <div className="sm:col-span-1">
                                        <label
                                            htmlFor="igvType"
                                            className="text-sm"
                                        >
                                            IGV %
                                        </label>
                                        <select
                                            value={sale.igvType}
                                            name="igvType"
                                            onChange={handleSale}
                                            className="form-control-sm"
                                            required
                                        >
                                            <option value={18}>18%</option>
                                            <option value={10}>
                                                10% (Ley 31556)
                                            </option>
                                            <option value={4}>4% (IVAP)</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="documentType"
                                            className="text-sm"
                                        >
                                            Tipo documento
                                        </label>
                                        <select
                                            value={sale.documentType}
                                            name="documentType"
                                            onChange={handleSale}
                                            className="form-control-sm"
                                            required
                                        >
                                            <option value={"01"}>
                                                FACTURA ELECTRÓNICA
                                            </option>
                                            <option value={"03"}>
                                                BOLETA DE VENTA ELECTRÓNICA
                                            </option>
                                            <option value={"07"}>
                                                NOTA DE CRÉDITO ELECTRÓNICA
                                            </option>
                                            <option value={"08"}>
                                                NOTA DE DÉBITO ELECTRÓNICA
                                            </option>
                                            <option value={"09"}>
                                                GUIA DE REMISIÓN REMITENTE
                                            </option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-1">
                                        <label
                                            htmlFor="emitDate"
                                            className="text-sm"
                                        >
                                            Fecha emisión
                                        </label>
                                        <input
                                            type="date"
                                            name="emitDate"
                                            id="emitDate"
                                            value={sale.emitDate}
                                            onChange={handleSale}
                                            onFocus={(e) => e.target.select()}
                                            className="form-control-sm"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2 grid-cols-4">
                                    <div className="sm:col-span-4">
                                        {personsError ? (
                                            <div>
                                                Error: No autorizado o error en
                                                la consulta.{" "}
                                                {personsError.message}
                                            </div>
                                        ) : (
                                            <>
                                                <label className="text-sm">
                                                    Cliente
                                                </label>
                                                <div className="relative w-full">
                                                    <input
                                                        type="text"
                                                        className="form-search-input-sm"
                                                        maxLength={200}
                                                        value={sale.clientName}
                                                        name="clientName"
                                                        onChange={handleSale}
                                                        onFocus={(e) =>
                                                            e.target.select()
                                                        }
                                                        autoComplete="off"
                                                        disabled={
                                                            personsLoading
                                                        }
                                                        placeholder="Buscar cliente..."
                                                        list="clientNameList"
                                                        required
                                                    />
                                                    <datalist id="clientNameList">
                                                        {personsData?.allClients?.map(
                                                            (
                                                                n: IPerson,
                                                                index: number
                                                            ) => (
                                                                <option
                                                                    key={index}
                                                                    data-key={
                                                                        n.id
                                                                    }
                                                                    value={`${n.documentNumber} ${n.names}`}
                                                                />
                                                            )
                                                        )}
                                                    </datalist>
                                                    <button
                                                        type="button"
                                                        className="form-search-button-sm"
                                                        onClick={(e) => {
                                                            modalPerson.show();
                                                            setPerson(
                                                                initialStatePerson
                                                            );
                                                        }}
                                                    >
                                                        <Add />
                                                        <span className="sr-only">
                                                            Search
                                                        </span>
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-2 grid-cols-4">
                                    <div className="sm:col-span-1">
                                        <label
                                            htmlFor="currencyType"
                                            className="text-sm"
                                        >
                                            Moneda
                                        </label>
                                        <select
                                            value={sale.currencyType}
                                            name="currencyType"
                                            onChange={handleSale}
                                            className="form-control-sm"
                                        >
                                            <option value={0} disabled>
                                                Moneda
                                            </option>
                                            <option value={"PEN"}>
                                                S/ PEN - SOLES
                                            </option>
                                            <option value={"USD"}>
                                                US$ USD - DÓLARES AMERICANOS
                                            </option>
                                            <option value={"EUR"}>
                                                € EUR - EUROS
                                            </option>
                                            <option value={"GBP"}>
                                                £ GBP - LIBRA ESTERLINA
                                            </option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-1">
                                        <label
                                            htmlFor="saleExchangeRate"
                                            className="text-sm"
                                        >
                                            Tipo de cambio
                                        </label>
                                        <input
                                            type="text"
                                            name="saleExchangeRate"
                                            id="saleExchangeRate"
                                            maxLength={10}
                                            value={sale.saleExchangeRate}
                                            onChange={handleSale}
                                            onFocus={(e) => e.target.select()}
                                            className="form-control-sm"
                                            autoComplete="off"
                                        />
                                    </div>

                                    <div className="sm:col-span-1">
                                        <label
                                            htmlFor="serial"
                                            className="text-sm"
                                        >
                                            Serie
                                        </label>
                                        <input
                                            type="text"
                                            name="serial"
                                            id="serial"
                                            maxLength={6}
                                            value={sale.serial}
                                            onChange={handleSale}
                                            onFocus={(e) => e.target.select()}
                                            className="form-control-sm"
                                            autoComplete="off"
                                        />
                                    </div>

                                    <div className="sm:col-span-1">
                                        <label
                                            htmlFor="correlative"
                                            className="text-sm"
                                        >
                                            Numero
                                        </label>
                                        <input
                                            type="text"
                                            name="correlative"
                                            id="correlative"
                                            maxLength={10}
                                            value={sale.correlative}
                                            onChange={handleSale}
                                            onFocus={(e) => e.target.select()}
                                            className="form-control-sm"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2 grid-cols-4">
                                    <div className="sm:col-span-4">
                                        <label className="text-sm">
                                            Buscar Producto o Servicio
                                        </label>
                                        <div className="relative w-full">
                                            <input
                                                type="text"
                                                className="form-search-input-sm"
                                                maxLength={100}
                                                value={product.name}
                                                name="name"
                                                onChange={handleProduct}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                autoComplete="off"
                                                disabled={productsLoading}
                                                placeholder="Buscar Producto..."
                                                list="productNameList"
                                                required
                                            />
                                            <datalist id="productNameList">
                                                {productsData?.allProducts?.map(
                                                    (
                                                        n: IProduct,
                                                        index: number
                                                    ) => (
                                                        <option
                                                            key={index}
                                                            data-key={n.id}
                                                            value={n.name}
                                                        />
                                                    )
                                                )}
                                            </datalist>
                                            <button
                                                type="button"
                                                className="form-search-button-sm"
                                                onClick={(e) => {
                                                    modalProduct.show();
                                                    setProduct(
                                                        initialStateProduct
                                                    );
                                                }}
                                            >
                                                <Add />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end py-2">
                                    <button
                                        type="button"
                                        className="btn-blue px-5 py-2 inline-flex items-center gap-2"
                                        onClick={(e) => {
                                            modalAddDetail.show();
                                            setSaleDetail(
                                                initialStateSaleDetail
                                            );
                                        }}
                                    >
                                        <Add /> AGREGAR ITEM
                                    </button>
                                </div>

                                <div className="overflow-hidden shadow">
                                    <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                                        <thead className="bg-gray-100 dark:bg-gray-700">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="p-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                                >
                                                    Descripción
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="p-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                                >
                                                    Cantidad
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="p-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                                >
                                                    C/U
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="p-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                                >
                                                    Subtotal
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="p-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                                                ></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sale?.operationdetailSet?.map(
                                                (item: any, i: number) => (
                                                    <tr
                                                        key={i}
                                                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                                    >
                                                        <td className="px-4 py-2">
                                                            {item.productName}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {item.unitValue}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {item.totalValue}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <div className="flex justify-end py-2">
                                                                <a
                                                                    className="hover:underline cursor-pointer"
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        modalAddDetail.show();
                                                                        setSaleDetail(
                                                                            item
                                                                        );
                                                                        setProduct(
                                                                            {
                                                                                ...product,
                                                                                id: Number(
                                                                                    item.productId
                                                                                ),
                                                                                name: item.productName,
                                                                            }
                                                                        );
                                                                    }}
                                                                >
                                                                    <Edit />
                                                                </a>

                                                                <a
                                                                    className="hover:underline cursor-pointer"
                                                                    onClick={() =>
                                                                        handleRemoveSaleDetail(
                                                                            Number(
                                                                                item?.temporaryId
                                                                            )
                                                                        )
                                                                    }
                                                                >
                                                                    <Delete />
                                                                </a>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="grid grid-cols-4">
                                    <div className="sm:col-span-3 text-right">
                                        % Descuento Global
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        0.00
                                    </div>
                                    <div className="sm:col-span-3 text-right">
                                        Descuento Global (-){" "}
                                        {sale.currencyType === "PEN"
                                            ? "S/"
                                            : sale.currencyType === "USD"
                                            ? "US$"
                                            : sale.currencyType === "EUR"
                                            ? "€"
                                            : sale.currencyType === "GBP"
                                            ? "£"
                                            : null}
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        {sale.discountGlobal}
                                    </div>
                                    <div className="sm:col-span-3 text-right">
                                        Descuento por Item (-){" "}
                                        {sale.currencyType === "PEN"
                                            ? "S/"
                                            : sale.currencyType === "USD"
                                            ? "US$"
                                            : sale.currencyType === "EUR"
                                            ? "€"
                                            : sale.currencyType === "GBP"
                                            ? "£"
                                            : null}
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        {sale.discountForItem}
                                    </div>
                                    <div className="sm:col-span-3 text-right">
                                        Descuento Total (-){" "}
                                        {sale.currencyType === "PEN"
                                            ? "S/"
                                            : sale.currencyType === "USD"
                                            ? "US$"
                                            : sale.currencyType === "EUR"
                                            ? "€"
                                            : sale.currencyType === "GBP"
                                            ? "£"
                                            : null}
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        {sale.totalDiscount}
                                    </div>
                                    <div className="sm:col-span-3 text-right">
                                        Exonerada{" "}
                                        {sale.currencyType === "PEN"
                                            ? "S/"
                                            : sale.currencyType === "USD"
                                            ? "US$"
                                            : sale.currencyType === "EUR"
                                            ? "€"
                                            : sale.currencyType === "GBP"
                                            ? "£"
                                            : null}
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        {sale.totalExonerated || "0.00"}
                                    </div>
                                    <div className="sm:col-span-3 text-right">
                                        Inafecta{" "}
                                        {sale.currencyType === "PEN"
                                            ? "S/"
                                            : sale.currencyType === "USD"
                                            ? "US$"
                                            : sale.currencyType === "EUR"
                                            ? "€"
                                            : sale.currencyType === "GBP"
                                            ? "£"
                                            : null}
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        {sale.totalUnaffected || "0.00"}
                                    </div>
                                    <div className="sm:col-span-3 text-right">
                                        Gravada{" "}
                                        {sale.currencyType === "PEN"
                                            ? "S/"
                                            : sale.currencyType === "USD"
                                            ? "US$"
                                            : sale.currencyType === "EUR"
                                            ? "€"
                                            : sale.currencyType === "GBP"
                                            ? "£"
                                            : null}
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        {sale.totalTaxed}
                                    </div>
                                    <div className="sm:col-span-3 text-right">
                                        IGV{" "}
                                        {sale.currencyType === "PEN"
                                            ? "S/"
                                            : sale.currencyType === "USD"
                                            ? "US$"
                                            : sale.currencyType === "EUR"
                                            ? "€"
                                            : sale.currencyType === "GBP"
                                            ? "£"
                                            : null}
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        {sale.totalIgv}
                                    </div>
                                    <div className="sm:col-span-3 text-right">
                                        Gratuita{" "}
                                        {sale.currencyType === "PEN"
                                            ? "S/"
                                            : sale.currencyType === "USD"
                                            ? "US$"
                                            : sale.currencyType === "EUR"
                                            ? "€"
                                            : sale.currencyType === "GBP"
                                            ? "£"
                                            : null}
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        {sale.totalFree || "0.00"}
                                    </div>
                                    <div className="sm:col-span-3 text-right">
                                        Otros Cargos{" "}
                                        {sale.currencyType === "PEN"
                                            ? "S/"
                                            : sale.currencyType === "USD"
                                            ? "US$"
                                            : sale.currencyType === "EUR"
                                            ? "€"
                                            : sale.currencyType === "GBP"
                                            ? "£"
                                            : null}
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        0.00
                                    </div>
                                    <div className="sm:col-span-3 text-right">
                                        Total{" "}
                                        {sale.currencyType === "PEN"
                                            ? "S/"
                                            : sale.currencyType === "USD"
                                            ? "US$"
                                            : sale.currencyType === "EUR"
                                            ? "€"
                                            : sale.currencyType === "GBP"
                                            ? "£"
                                            : null}
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        {sale.totalAmount}
                                    </div>
                                </div>
                                <div className="flex justify-end py-2">
                                    <button
                                        type="button"
                                        className={`btn-blue px-5 py-2 inline-flex items-center gap-2 ${
                                            sale?.operationdetailSet?.length ===
                                            0
                                                ? "cursor-not-allowed"
                                                : ""
                                        }`}
                                        onClick={async () => {
                                            if (Number(sale.clientId) === 0) {
                                                toast(
                                                    "Por favor ingrese un cliente.",
                                                    {
                                                        hideProgressBar: true,
                                                        autoClose: 2000,
                                                        type: "warning",
                                                    }
                                                );
                                                return;
                                            }
                                            if (
                                                sale.operationdetailSet
                                                    .length === 0
                                            ) {
                                                toast(
                                                    "Por favor ingrese al menos un item.",
                                                    {
                                                        hideProgressBar: true,
                                                        autoClose: 2000,
                                                        type: "warning",
                                                    }
                                                );
                                                return;
                                            }
                                            modalWayPay.show();
                                            setSale({
                                                ...sale,
                                                totalPayed: "",
                                                cashflowSet: [],
                                            });
                                            setCashFlow({
                                                ...cashFlow,
                                                total: Number(sale.totalToPay),
                                            });
                                        }}
                                        disabled={
                                            sale?.operationdetailSet?.length ===
                                            0
                                        }
                                    >
                                        <Save />
                                        CONTINUAR CON EL PAGO
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ProductForm
                modalProduct={modalProduct}
                setModalProduct={setModalProduct}
                product={product}
                setProduct={setProduct}
                jwtToken={jwtToken}
                initialStateProduct={initialStateProduct}
                typeAffectationsData={typeAffectationsData}
                PRODUCTS_QUERY={PRODUCTS_QUERY}
                productFilterObj={productFilterObj}
            />
            {/* <ClientForm modalAddPerson={modalAddPerson} setModalAddPerson={setModalAddPerson} person={person} setPerson={setPerson} jwtToken={jwtToken} SUPPLIERS_QUERY={SUPPLIERS_QUERY} purchase={purchase} setPurchase={setPurchase} /> */}
            <ProductForm
                modalProduct={modalProduct}
                setModalProduct={setModalProduct}
                product={product}
                setProduct={setProduct}
                jwtToken={jwtToken}
                initialStateProduct={initialStateProduct}
                typeAffectationsData={typeAffectationsData}
                PRODUCTS_QUERY={PRODUCTS_QUERY}
                productFilterObj={productFilterObj}
            />
            <SaleDetailForm
                modalAddDetail={modalAddDetail}
                setModalAddDetail={setModalAddDetail}
                product={product}
                setProduct={setProduct}
                saleDetail={saleDetail}
                setSaleDetail={setSaleDetail}
                sale={sale}
                setSale={setSale}
                jwtToken={jwtToken}
                initialStateProduct={initialStateProduct}
                initialStateSaleDetail={initialStateSaleDetail}
                typeAffectationsData={typeAffectationsData}
                productsData={productsData}
            />
            <WayPayForm
                modalWayPay={modalWayPay}
                setModalWayPay={setModalWayPay}
                cashFlow={cashFlow}
                setCashFlow={setCashFlow}
                initialStateCashFlow={initialStateCashFlow}
                initialStateSale={initialStateSale}
                sale={sale}
                setSale={setSale}
                jwtToken={jwtToken}
                wayPaysData={wayPaysData}
            />
        </>
    );
}

export default NewSalePage;
