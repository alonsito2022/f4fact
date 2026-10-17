"use client";
import React, {
    ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

export interface ComboboxOption {
    id: number | string;
    /** Texto principal que se escribe en el input al elegir. */
    label: string;
    /** Linea secundaria (razon social, descripcion...). */
    description?: string;
    /** Chip a la izquierda (RUC, codigo de producto). */
    badge?: string;
    /** Texto alineado a la derecha (precio, stock). */
    meta?: string;
    /** Valor original, por si el consumidor necesita mas datos. */
    raw?: any;
}

interface ComboboxProps {
    value: string;
    onChange: (value: string) => void;
    /**
     * Se invoca SOLO al elegir una opcion del panel. El consumidor debe
     * escribir en `value` lo que corresponda (onChange no se dispara aqui para
     * no resetear la seleccion recien hecha).
     */
    onSelect: (option: ComboboxOption) => void;
    options: ComboboxOption[];
    loading?: boolean;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    maxLength?: number;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
    name?: string;
    emptyMessage?: string;
    loadingMessage?: string;
    icon?: ReactNode;
    /** Contenido a la derecha del input (botones de accion). */
    actions?: ReactNode;
    /** Selecciona todo el texto al enfocar. */
    selectOnFocus?: boolean;
    /** Abre el desplegable al enfocar. */
    openOnFocus?: boolean;
    /** Controla el panel desde fuera (para cerrarlo al abrir un modal). */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    autoFocus?: boolean;
    inputRef?: React.Ref<HTMLInputElement>;
    onEnter?: () => void;
    className?: string;
    inputClassName?: string;
    id?: string;
}

/**
 * Autocompletado con panel propio.
 *
 * El <datalist> nativo no se puede estilizar (el navegador dibuja la lista), por
 * lo que se reemplaza por este combobox: mismo contrato de datos (id + texto +
 * precio), pero con panel, estados de carga/vacio y navegacion por teclado.
 */
function Combobox({
    value,
    onChange,
    onSelect,
    options,
    loading = false,
    placeholder,
    disabled = false,
    required = false,
    maxLength,
    inputMode,
    name,
    emptyMessage = "Sin resultados",
    loadingMessage = "Buscando...",
    icon,
    actions,
    selectOnFocus = true,
    openOnFocus = true,
    open,
    onOpenChange,
    autoFocus = false,
    inputRef,
    onEnter,
    className = "",
    inputClassName = "",
    id,
}: ComboboxProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [highlight, setHighlight] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const localInputRef = useRef<HTMLInputElement>(null);
    const inputEl = inputRef ?? localInputRef;

    // Si el padre controla `open`, manda el padre.
    const isOpen = open ?? internalOpen;
    const setOpen = (value: boolean) => {
        setInternalOpen(value);
        onOpenChange?.(value);
    };

    useEffect(() => {
        if (!isOpen) return;
        const onDocMouseDown = (e: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", onDocMouseDown);
        return () =>
            document.removeEventListener("mousedown", onDocMouseDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const showPanel = isOpen && (options.length > 0 || loading);

    const commit = (option: ComboboxOption) => {
        // Primero se cierra el panel y despues se avisa de la seleccion.
        // El orden importa: si se llamara antes onChange, los consumidores que
        // resetean el id al escribir dejarian la seleccion sin id.
        setOpen(false);
        setHighlight(-1);
        onSelect(option);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!isOpen) {
                setOpen(true);
                return;
            }
            setHighlight((h) => (options.length ? (h + 1) % options.length : -1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) =>
                options.length ? (h - 1 + options.length) % options.length : -1,
            );
        } else if (e.key === "Enter") {
            // Si hay algo resaltado se elige ese; si no, se deja pasar el
            // Enter al formulario como antes.
            if (isOpen && highlight >= 0 && options[highlight]) {
                e.preventDefault();
                commit(options[highlight]);
            } else if (onEnter) {
                onEnter();
            }
        } else if (e.key === "Escape") {
            if (isOpen) {
                e.preventDefault();
                setOpen(false);
                setHighlight(-1);
            }
        }
    };

    const listId = useMemo(
        () => `combobox-list-${Math.random().toString(36).slice(2, 9)}`,
        [],
    );

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            {icon && (
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    {icon}
                </span>
            )}

            <input
                id={id}
                ref={inputEl as any}
                type="text"
                name={name}
                value={value}
                disabled={disabled}
                required={required}
                maxLength={maxLength}
                inputMode={inputMode}
                autoComplete="off"
                autoFocus={autoFocus}
                role="combobox"
                aria-expanded={showPanel}
                aria-controls={listId}
                aria-autocomplete="list"
                placeholder={placeholder}
                onChange={(e) => {
                    onChange(e.target.value);
                    setHighlight(-1);
                    setOpen(true);
                }}
                onFocus={(e) => {
                    if (openOnFocus) setOpen(true);
                    if (selectOnFocus) e.target.select();
                }}
                onKeyDown={handleKeyDown}
                className={`block w-full rounded-xl border bg-white py-2 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:disabled:bg-gray-800/60 ${
                    icon ? "pl-9" : "pl-3"
                } ${actions ? "pr-3" : "pr-3"} ${inputClassName}`}
            />

            {actions && (
                <div className="absolute inset-y-0 right-1.5 flex items-center gap-1.5">
                    {actions}
                </div>
            )}

            {/* Panel de resultados */}
            {showPanel && (
                <div
                    id={listId}
                    role="listbox"
                    className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-64 overflow-y-auto overscroll-contain rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-gray-700 dark:bg-gray-800"
                >
                    {loading && options.length === 0 && (
                        <div className="flex items-center gap-2.5 px-3 py-3 text-[13px] text-gray-500 dark:text-gray-400">
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600 dark:border-blue-800 dark:border-t-blue-400" />
                            {loadingMessage}
                        </div>
                    )}

                    {!loading && options.length === 0 && (
                        <div className="px-3 py-3 text-[13px] text-gray-500 dark:text-gray-400">
                            {emptyMessage}
                        </div>
                    )}

                    {options.map((option, index) => {
                        const selected = index === highlight;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                role="option"
                                aria-selected={selected}
                                // mousedown antes que click para que el input
                                // no pierda el foco antes de seleccionar
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    commit(option);
                                }}
                                onMouseEnter={() => setHighlight(index)}
                                className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                                    selected
                                        ? "bg-blue-50 dark:bg-blue-500/15"
                                        : "hover:bg-gray-50 dark:hover:bg-gray-700/60"
                                }`}
                            >
                                {option.badge && (
                                    <span className="inline-flex shrink-0 items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600 tabular-nums dark:bg-gray-700 dark:text-gray-300">
                                        {option.badge}
                                    </span>
                                )}

                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-[13px] font-medium text-gray-900 dark:text-white">
                                        {option.label}
                                    </span>
                                    {option.description && (
                                        <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">
                                            {option.description}
                                        </span>
                                    )}
                                </span>

                                {option.meta && (
                                    <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-gray-700 tabular-nums dark:text-gray-200">
                                        {option.meta}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Combobox;