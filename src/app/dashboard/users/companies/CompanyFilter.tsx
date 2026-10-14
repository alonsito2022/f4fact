import React from "react";

function CompanyFilter({
    searchTerm,
    setSearchTerm,
    modal,
    user,
    resultCount,
}: any) {
    return (
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
                <svg
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                    />
                </svg>
                <input
                    type="search"
                    name="searchTerm"
                    id="companies-search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoComplete="off"
                    aria-label="Buscar empresa"
                    placeholder="Buscar por razón social, RUC o nombre..."
                    className="h-9 w-full !rounded-xl !border-gray-300 !bg-white pl-9 pr-3 text-[13px] text-gray-800 transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:!border-gray-700 dark:!bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                />
            </div>

            {resultCount > 0 && (
                <span className="hidden whitespace-nowrap text-xs text-gray-500 tabular-nums sm:inline dark:text-gray-400">
                    {resultCount}{" "}
                    {resultCount === 1 ? "empresa" : "empresas"}
                </span>
            )}

            {user?.isSuperuser && (
                <button
                    id="createCompanyButton"
                    type="button"
                    onClick={() => modal.show()}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-blue-200 bg-blue-50 px-3.5 text-[13px] font-semibold leading-none text-blue-700 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-200/70 dark:border-blue-400/40 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:border-blue-400/70 dark:hover:bg-blue-500/20 dark:focus:ring-blue-500/30"
                >
                    <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                        />
                    </svg>
                    Crear Empresa
                </button>
            )}
        </div>
    );
}

export default CompanyFilter;