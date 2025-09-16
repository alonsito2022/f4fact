import { IUnit, IProduct } from "@/app/types";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";

function ProductTariffForm({ setProduct, product }: any) {
    const [hiddenSections, setHiddenSections] = useState({
        retailSale: true,
        wholesaleSale: false,
        retailPurchase: false,
        wholesalePurchase: false,
    });
    const toggleSection = (section: keyof typeof hiddenSections) => {
        setHiddenSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };
    const handleInputChangeProductTariff = ({
        target: { name, value },
    }: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >) => {
        // Limitar a 6 dígitos enteros y 2 decimales (máximo 999999.99)
        let formattedValue = value.replace(/[^0-9.]/g, "").slice(0, 9);
        // Asegurar un solo punto decimal y máximo 2 decimales
        const hasDecimal = formattedValue.indexOf(".") !== -1;
        if (hasDecimal) {
            formattedValue = formattedValue.slice(
                0,
                formattedValue.indexOf(".") + 3
            );
        }

        if (name === "priceWithIgv1")
            setProduct({
                ...product,
                priceWithIgv1: formattedValue,
                priceWithoutIgv1: Number(Number(formattedValue) / 1.18).toFixed(
                    6
                ),
            });
        else if (name === "priceWithoutIgv1")
            setProduct({
                ...product,
                priceWithoutIgv1: formattedValue,
                priceWithIgv1: Number(Number(formattedValue) * 1.18).toFixed(6),
            });
        else if (name === "priceWithIgv2")
            setProduct({
                ...product,
                priceWithIgv2: formattedValue,
                priceWithoutIgv2: Number(Number(formattedValue) / 1.18).toFixed(
                    6
                ),
            });
        else if (name === "priceWithoutIgv2")
            setProduct({
                ...product,
                priceWithoutIgv2: formattedValue,
                priceWithIgv2: Number(Number(formattedValue) * 1.18).toFixed(6),
            });
        else if (name === "priceWithIgv3")
            setProduct({
                ...product,
                priceWithIgv3: formattedValue,
                priceWithoutIgv3: Number(Number(formattedValue) / 1.18).toFixed(
                    6
                ),
            });
        else if (name === "priceWithoutIgv3")
            setProduct({
                ...product,
                priceWithoutIgv3: formattedValue,
                priceWithIgv3: Number(Number(formattedValue) * 1.18).toFixed(6),
            });
        else if (name === "priceWithIgv4")
            setProduct({
                ...product,
                priceWithIgv4: formattedValue,
                priceWithoutIgv4: Number(Number(formattedValue) / 1.18).toFixed(
                    6
                ),
            });
        else if (name === "priceWithoutIgv4")
            setProduct({
                ...product,
                priceWithoutIgv4: formattedValue,
                priceWithIgv4: Number(Number(formattedValue) * 1.18).toFixed(6),
            });
        else setProduct({ ...product, [name]: formattedValue });
    };

    return (
        <>
            <div className="sm:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna de Ventas */}
                <div className="md:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">
                            Precios de Venta
                        </h3>
                        <div className="flex gap-4 text-sm">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="retailSale"
                                    checked={hiddenSections.retailSale}
                                    onChange={() => toggleSection("retailSale")}
                                    className="form-check-input"
                                />
                                Al por menor
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="wholesaleSale"
                                    checked={hiddenSections.wholesaleSale}
                                    onChange={() =>
                                        toggleSection("wholesaleSale")
                                    }
                                    className="form-check-input"
                                />
                                Al por mayor
                            </label>
                        </div>
                    </div>

                    <fieldset
                        className={`${
                            hiddenSections.retailSale ? "border p-3" : "hidden"
                        } dark:border-gray-500 border-gray-200 rounded`}
                    >
                        <legend className="text-xs px-2">Al por menor</legend>
                        <div
                            className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                                hiddenSections.retailSale ? "" : "hidden"
                            }`}
                        >
                            <div>
                                <label
                                    htmlFor="priceWithoutIgv3"
                                    className="form-label text-sm"
                                >
                                    Valor sin IGV
                                </label>
                                <input
                                    type="number"
                                    name="priceWithoutIgv3"
                                    onWheel={(e) => e.currentTarget.blur()}
                                    value={product.priceWithoutIgv3}
                                    onChange={(e) =>
                                        handleInputChangeProductTariff(e)
                                    }
                                    onFocus={(e) => e.target.select()}
                                    className="form-control"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="priceWithIgv3"
                                    className="form-label text-sm"
                                >
                                    Precio con IGV
                                </label>
                                <input
                                    type="number"
                                    name="priceWithIgv3"
                                    onWheel={(e) => e.currentTarget.blur()}
                                    value={product.priceWithIgv3}
                                    onChange={(e) =>
                                        handleInputChangeProductTariff(e)
                                    }
                                    onFocus={(e) => e.target.select()}
                                    className="form-control"
                                />
                            </div>
                        </div>
                    </fieldset>

                    <fieldset
                        className={`${
                            hiddenSections.wholesaleSale
                                ? "border p-3"
                                : "hidden"
                        } dark:border-gray-500 border-gray-200 rounded`}
                    >
                        <legend className="text-xs px-2">Al por mayor</legend>
                        <div
                            className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                                hiddenSections.wholesaleSale ? "" : "hidden"
                            }`}
                        >
                            <div>
                                <label
                                    htmlFor="priceWithoutIgv4"
                                    className="form-label text-sm"
                                >
                                    Valor sin IGV
                                </label>
                                <input
                                    type="number"
                                    name="priceWithoutIgv4"
                                    onWheel={(e) => e.currentTarget.blur()}
                                    value={product.priceWithoutIgv4}
                                    onChange={(e) =>
                                        handleInputChangeProductTariff(e)
                                    }
                                    onFocus={(e) => e.target.select()}
                                    className="form-control"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="priceWithIgv4"
                                    className="form-label text-sm"
                                >
                                    Precio con IGV
                                </label>
                                <input
                                    type="number"
                                    name="priceWithIgv4"
                                    onWheel={(e) => e.currentTarget.blur()}
                                    value={product.priceWithIgv4}
                                    onChange={(e) =>
                                        handleInputChangeProductTariff(e)
                                    }
                                    onFocus={(e) => e.target.select()}
                                    className="form-control"
                                />
                            </div>
                        </div>
                    </fieldset>
                </div>

                {/* Columna de Compras */}
                <div className="md:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">
                            Precios de Compra
                        </h3>
                        <div className="flex gap-4 text-sm">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="retailPurchase"
                                    checked={hiddenSections.retailPurchase}
                                    onChange={() =>
                                        toggleSection("retailPurchase")
                                    }
                                    className="form-check-input"
                                />
                                Al por menor
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="wholesalePurchase"
                                    checked={hiddenSections.wholesalePurchase}
                                    onChange={() =>
                                        toggleSection("wholesalePurchase")
                                    }
                                    className="form-check-input"
                                />
                                Al por mayor
                            </label>
                        </div>
                    </div>

                    <fieldset
                        className={`${
                            hiddenSections.retailPurchase
                                ? "border p-3"
                                : "hidden"
                        } dark:border-gray-500 border-gray-200 rounded`}
                    >
                        <legend className="text-xs px-2">Al por menor</legend>
                        <div
                            className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                                hiddenSections.retailPurchase ? "" : "hidden"
                            }`}
                        >
                            <div>
                                <label
                                    htmlFor="priceWithoutIgv1"
                                    className="form-label text-sm"
                                >
                                    Valor sin IGV
                                </label>
                                <input
                                    type="number"
                                    name="priceWithoutIgv1"
                                    onWheel={(e) => e.currentTarget.blur()}
                                    value={product.priceWithoutIgv1}
                                    onChange={(e) =>
                                        handleInputChangeProductTariff(e)
                                    }
                                    onFocus={(e) => e.target.select()}
                                    className="form-control"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="priceWithIgv1"
                                    className="form-label text-sm"
                                >
                                    Precio con IGV
                                </label>
                                <input
                                    type="number"
                                    name="priceWithIgv1"
                                    onWheel={(e) => e.currentTarget.blur()}
                                    value={product.priceWithIgv1}
                                    onChange={(e) =>
                                        handleInputChangeProductTariff(e)
                                    }
                                    onFocus={(e) => e.target.select()}
                                    className="form-control"
                                />
                            </div>
                        </div>
                    </fieldset>

                    <fieldset
                        className={`${
                            hiddenSections.wholesalePurchase
                                ? "border p-3"
                                : "hidden"
                        } dark:border-gray-500 border-gray-200 rounded`}
                    >
                        <legend className="text-xs px-2">Al por mayor</legend>
                        <div
                            className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                                hiddenSections.wholesalePurchase ? "" : "hidden"
                            }`}
                        >
                            <div>
                                <label
                                    htmlFor="priceWithoutIgv2"
                                    className="form-label text-sm"
                                >
                                    Valor sin IGV
                                </label>
                                <input
                                    type="number"
                                    name="priceWithoutIgv2"
                                    onWheel={(e) => e.currentTarget.blur()}
                                    value={product.priceWithoutIgv2}
                                    onChange={(e) =>
                                        handleInputChangeProductTariff(e)
                                    }
                                    onFocus={(e) => e.target.select()}
                                    className="form-control"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="priceWithIgv2"
                                    className="form-label text-sm"
                                >
                                    Precio con IGV
                                </label>
                                <input
                                    type="number"
                                    name="priceWithIgv2"
                                    onWheel={(e) => e.currentTarget.blur()}
                                    value={product.priceWithIgv2}
                                    onChange={(e) =>
                                        handleInputChangeProductTariff(e)
                                    }
                                    onFocus={(e) => e.target.select()}
                                    className="form-control"
                                />
                            </div>
                        </div>
                    </fieldset>
                </div>
            </div>
        </>
    );
}

export default ProductTariffForm;
