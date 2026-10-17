import React, { useMemo } from "react";

function SalePagination({
    filterObj,
    setFilterObj,
    salesQuery,
    filteredSalesData,
    guidesQuery,
    guidesData,
    quotesQuery,
    quotesData,
    exitNotesQuery,
    exitNotesData,
    compact,
}: any) {
    const totalPages = filteredSalesData
        ? filteredSalesData?.allSales?.totalNumberOfPages
        : guidesData
          ? guidesData?.allGuides?.totalNumberOfPages
          : quotesData?.allQuotes?.totalNumberOfPages ||
            exitNotesData?.allExitNotes?.totalNumberOfPages ||
            1;

    const totalRecords = filteredSalesData
        ? filteredSalesData?.allSales?.totalNumberOfSales
        : guidesData
          ? guidesData?.allGuides?.totalNumberOfSales
          : quotesData?.allQuotes?.totalNumberOfSales ||
            exitNotesData?.allExitNotes?.totalNumberOfNotes ||
            0;

    const currentPage = filterObj.page || 1;
    const pageSize = Number(filterObj.pageSize) || 50;
    const startRecord = (currentPage - 1) * pageSize + 1;
    const endRecord = Math.min(currentPage * pageSize, totalRecords);

    // Convierte a entero solo si hay un valor usable. Evita mandar NaN a una
    // variable Int (Apollo descarta la respuesta entera si no puede
    // serializarla) y, en lugar de 0, omite los filtros sin valor para que el
    // backend los ignore igual que la consulta inicial.
    const toInt = (value: unknown): number | undefined => {
        if (value === "" || value === null || value === undefined) {
            return undefined;
        }
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    };

    // Una sola fuente de verdad para las variables: antes goToPage y
    // handlePageSizeChange las montaban por separado y ya se habian
    // desincronizado de la consulta inicial.
    const buildVariables = (page: number, size: number) => {
        const variables: any = {
            subsidiaryId: toInt(filterObj?.subsidiaryId) ?? 0,
            clientId: toInt(filterObj.clientId) ?? 0,
            startDate: filterObj.startDate,
            endDate: filterObj.endDate,
            documentType: filterObj.documentType,
            page,
            pageSize: size,
            // Apollo fusiona las variables de cada ejecucion con las de la
            // anterior. Si "Buscar Documento" mando serial/correlative y aqui
            // se omiten, el backend recibe ese par y filtra por un unico
            // comprobante: cada pagina terminaba mostrando 1 registro. Se
            // envian siempre; undefined si no hay busqueda activa.
            serial: filterObj.serial ? String(filterObj.serial) : undefined,
            correlative: toInt(filterObj.correlative),
        };
        const userId = toInt(filterObj.userId);
        if (userId !== undefined) variables.userId = userId;
        if (salesQuery) {
            const onlyDraft = filterObj.onlyDraft || undefined;
            if (onlyDraft !== undefined) variables.onlyDraft = onlyDraft;
        }
        return variables;
    };

    // fetchPolicy explicito: la query de ventas esta configurada con
    // cache-and-network + nextFetchPolicy cache-first, asi que sin esto el
    // clic en otra pagina podia resolverse desde la cache de Apollo y la tabla
    // se quedaba igual. El boton Filtrar ya hacia lo mismo.
    const runQuery = (variables: any) => {
        const queryToUse =
            salesQuery || guidesQuery || quotesQuery || exitNotesQuery;
        if (queryToUse) {
            queryToUse({ variables, fetchPolicy: "network-only" });
        }
    };

    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        setFilterObj({
            ...filterObj,
            page,
        });
        runQuery(buildVariables(page, pageSize));
    };

    const handlePageSizeChange = (newSize: number) => {
        setFilterObj({
            ...filterObj,
            pageSize: newSize,
            page: 1,
        });
        runQuery(buildVariables(1, newSize));
    };

    const pageNumbers = useMemo(() => {
        const pages: (number | "...")[] = [];
        if (totalPages <= 9) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 4) pages.push("...");
            const start = Math.max(2, currentPage - 2);
            const end = Math.min(totalPages - 1, currentPage + 2);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 3) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    }, [currentPage, totalPages]);

    if (!totalPages || totalPages <= 0) return null;

    return (
        <div
            className={`flex flex-col items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 dark:border-gray-700/50 dark:bg-gray-800/30 sm:flex-row ${
                compact
                    ? "gap-3 px-4 py-3 lg:gap-2 lg:px-3 lg:py-1.5"
                    : "gap-3 px-4 py-3"
            }`}
        >
            <div className="text-xs text-gray-500 dark:text-gray-400">
                Mostrando{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {startRecord.toLocaleString("es-PE")}
                </span>{" "}
                a{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {endRecord.toLocaleString("es-PE")}
                </span>{" "}
                de{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {totalRecords?.toLocaleString("es-PE")}
                </span>{" "}
                registros
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                    Primera
                </button>

                <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Anterior
                </button>

                {pageNumbers.map((page, index) =>
                    page === "..." ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-1 py-1 text-xs text-gray-400 dark:text-gray-500 select-none"
                        >
                            ···
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => goToPage(page as number)}
                            className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-all border ${
                                currentPage === page
                                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 dark:shadow-blue-900/40"
                                    : "text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500"
                            }`}
                        >
                            {page}
                        </button>
                    ),
                )}

                <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    Siguiente
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    Última
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Filas:</span>
                <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                    {[10, 20, 25, 50, 100].map((size) => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

export default SalePagination;
