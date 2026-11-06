import { ChangeEvent, useState } from "react";

const roundTwo = (value: number) => Number(value).toFixed(2);

const priceFieldClass =
    "h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-right text-sm font-semibold tabular-nums text-slate-800 outline-none transition-all duration-200 placeholder:font-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-500";

const toggleClass =
    "inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700";

const toggleInputClass =
    "h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-500 dark:bg-gray-700";

function PriceField({
    id,
    label,
    name,
    value,
    onChange,
}: {
    id: string;
    label: string;
    name: string;
    value: string | number;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <label htmlFor={id} className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                {label}
            </span>
            <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[11px] font-bold text-slate-400">
                    S/
                </span>
                <input
                    type="number"
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onWheel={(e) => e.currentTarget.blur()}
                    onFocus={(e) => e.target.select()}
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    placeholder="0.00"
                    className={priceFieldClass}
                />
            </div>
        </label>
    );
}

function ProductTariffForm({ setProduct, product, auth }: any) {
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
        const raw = value.replace(/[^0-9.]/g, "");
        const parts = raw.split(".");
        const integerPart = (parts[0] || "0").slice(0, 6);
        const decimalPart =
            parts.length > 1 ? parts.slice(1).join("").slice(0, 2) : "";
        const formattedValue = decimalPart
            ? `${integerPart}.${decimalPart}`
            : integerPart;

        const igvPercentage = Number(auth?.user?.companyPercentageIgv) || 18;
        const igvFactor = 1 + igvPercentage / 100;

        if (name === "priceWithIgv1")
            setProduct({
                ...product,
                priceWithIgv1: formattedValue,
                priceWithoutIgv1: roundTwo(
                    Number(formattedValue) / igvFactor
                ),
            });
        else if (name === "priceWithoutIgv1")
            setProduct({
                ...product,
                priceWithoutIgv1: formattedValue,
                priceWithIgv1: roundTwo(Number(formattedValue) * igvFactor),
            });
        else if (name === "priceWithIgv2")
            setProduct({
                ...product,
                priceWithIgv2: formattedValue,
                priceWithoutIgv2: roundTwo(
                    Number(formattedValue) / igvFactor
                ),
            });
        else if (name === "priceWithoutIgv2")
            setProduct({
                ...product,
                priceWithoutIgv2: formattedValue,
                priceWithIgv2: roundTwo(Number(formattedValue) * igvFactor),
            });
        else if (name === "priceWithIgv3")
            setProduct({
                ...product,
                priceWithIgv3: formattedValue,
                priceWithoutIgv3: roundTwo(
                    Number(formattedValue) / igvFactor
                ),
            });
        else if (name === "priceWithoutIgv3")
            setProduct({
                ...product,
                priceWithoutIgv3: formattedValue,
                priceWithIgv3: roundTwo(Number(formattedValue) * igvFactor),
            });
        else if (name === "priceWithIgv4")
            setProduct({
                ...product,
                priceWithIgv4: formattedValue,
                priceWithoutIgv4: roundTwo(
                    Number(formattedValue) / igvFactor
                ),
            });
        else if (name === "priceWithoutIgv4")
            setProduct({
                ...product,
                priceWithoutIgv4: formattedValue,
                priceWithIgv4: roundTwo(Number(formattedValue) * igvFactor),
            });
        else setProduct({ ...product, [name]: formattedValue });
    };

    return (
        <div className="grid gap-5 xl:grid-cols-2">
            {/* Precios de venta */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-800/60">
                <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />
                <div className="border-b border-slate-100 px-4 py-3.5 dark:border-gray-700">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </span>
                            <div>
                                <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
                                    Precios de venta
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-gray-400">
                                    Tarifas aplicadas a tus clientes
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <label className={toggleClass}>
                                <input
                                    type="checkbox"
                                    id="retailSale"
                                    checked={hiddenSections.retailSale}
                                    onChange={() => toggleSection("retailSale")}
                                    className={toggleInputClass}
                                />
                                Al por menor
                            </label>
                            <label className={toggleClass}>
                                <input
                                    type="checkbox"
                                    id="wholesaleSale"
                                    checked={hiddenSections.wholesaleSale}
                                    onChange={() =>
                                        toggleSection("wholesaleSale")
                                    }
                                    className={toggleInputClass}
                                />
                                Al por mayor
                            </label>
                        </div>
                    </div>
                </div>
                <div className="space-y-4 p-4">
                    <div
                        className={
                            hiddenSections.retailSale
                                ? "rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-gray-600 dark:bg-gray-700/30"
                                : "hidden"
                        }
                    >
                        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                            Al por menor
                        </p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <PriceField
                                id="priceWithoutIgv3"
                                label="Valor sin IGV"
                                name="priceWithoutIgv3"
                                value={product.priceWithoutIgv3}
                                onChange={handleInputChangeProductTariff}
                            />
                            <PriceField
                                id="priceWithIgv3"
                                label="Precio con IGV"
                                name="priceWithIgv3"
                                value={product.priceWithIgv3}
                                onChange={handleInputChangeProductTariff}
                            />
                        </div>
                    </div>

                    <div
                        className={
                            hiddenSections.wholesaleSale
                                ? "rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-gray-600 dark:bg-gray-700/30"
                                : "hidden"
                        }
                    >
                        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                            Al por mayor
                        </p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <PriceField
                                id="priceWithoutIgv4"
                                label="Valor sin IGV"
                                name="priceWithoutIgv4"
                                value={product.priceWithoutIgv4}
                                onChange={handleInputChangeProductTariff}
                            />
                            <PriceField
                                id="priceWithIgv4"
                                label="Precio con IGV"
                                name="priceWithIgv4"
                                value={product.priceWithIgv4}
                                onChange={handleInputChangeProductTariff}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Precios de compra */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-800/60">
                <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500" />
                <div className="border-b border-slate-100 px-4 py-3.5 dark:border-gray-700">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </span>
                            <div>
                                <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
                                    Precios de compra
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-gray-400">
                                    Costos registrados para tu operación
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <label className={toggleClass}>
                                <input
                                    type="checkbox"
                                    id="retailPurchase"
                                    checked={hiddenSections.retailPurchase}
                                    onChange={() =>
                                        toggleSection("retailPurchase")
                                    }
                                    className={toggleInputClass}
                                />
                                Al por menor
                            </label>
                            <label className={toggleClass}>
                                <input
                                    type="checkbox"
                                    id="wholesalePurchase"
                                    checked={hiddenSections.wholesalePurchase}
                                    onChange={() =>
                                        toggleSection("wholesalePurchase")
                                    }
                                    className={toggleInputClass}
                                />
                                Al por mayor
                            </label>
                        </div>
                    </div>
                </div>
                <div className="space-y-4 p-4">
                    <div
                        className={
                            hiddenSections.retailPurchase
                                ? "rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-gray-600 dark:bg-gray-700/30"
                                : "hidden"
                        }
                    >
                        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                            Al por menor
                        </p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <PriceField
                                id="priceWithoutIgv1"
                                label="Valor sin IGV"
                                name="priceWithoutIgv1"
                                value={product.priceWithoutIgv1}
                                onChange={handleInputChangeProductTariff}
                            />
                            <PriceField
                                id="priceWithIgv1"
                                label="Precio con IGV"
                                name="priceWithIgv1"
                                value={product.priceWithIgv1}
                                onChange={handleInputChangeProductTariff}
                            />
                        </div>
                    </div>

                    <div
                        className={
                            hiddenSections.wholesalePurchase
                                ? "rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-gray-600 dark:bg-gray-700/30"
                                : "hidden"
                        }
                    >
                        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                            Al por mayor
                        </p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <PriceField
                                id="priceWithoutIgv2"
                                label="Valor sin IGV"
                                name="priceWithoutIgv2"
                                value={product.priceWithoutIgv2}
                                onChange={handleInputChangeProductTariff}
                            />
                            <PriceField
                                id="priceWithIgv2"
                                label="Precio con IGV"
                                name="priceWithIgv2"
                                value={product.priceWithIgv2}
                                onChange={handleInputChangeProductTariff}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductTariffForm;
