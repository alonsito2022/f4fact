import React from "react";

function SalePagination({
    filterObj,
    setFilterObj,
    salesQuery,
    filteredSalesData,
}: any) {
    return (
        <div className="flex items-center justify-center gap-2 my-4">
            <button
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                disabled={filterObj.page === 1}
                onClick={() => {
                    setFilterObj({
                        ...filterObj,
                        page: filterObj.page - 1,
                    });
                    salesQuery({
                        variables: {
                            subsidiaryId: Number(filterObj?.subsidiaryId),
                            clientId: Number(filterObj.clientId),
                            startDate: filterObj.startDate,
                            endDate: filterObj.endDate,
                            documentType: filterObj.documentType,
                            page: filterObj.page - 1,
                            pageSize: Number(filterObj.pageSize),
                        },
                    });
                }}
            >
                <svg
                    className="w-3.5 h-3.5 me-2 rtl:rotate-180"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 10"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 5H1m0 0 4 4M1 5l4-4"
                    />
                </svg>
                Anterior
            </button>

            <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                Página <span className="font-bold mx-2">{filterObj.page}</span>{" "}
                de{" "}
                <span className="font-bold mx-2">
                    {filteredSalesData?.allSales?.totalNumberOfPages}
                </span>
            </span>

            <button
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                onClick={() => {
                    setFilterObj({
                        ...filterObj,
                        page: filterObj.page + 1,
                    });
                    salesQuery({
                        variables: {
                            subsidiaryId: Number(filterObj.subsidiaryId),
                            clientId: Number(filterObj.clientId),
                            startDate: filterObj.startDate,
                            endDate: filterObj.endDate,
                            documentType: filterObj.documentType,
                            page: filterObj.page + 1,
                            pageSize: Number(filterObj.pageSize),
                        },
                    });
                }}
                disabled={
                    filterObj.page ===
                    filteredSalesData?.allSales?.totalNumberOfPages
                }
            >
                Siguiente
                <svg
                    className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 10"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 5h12m0 0L9 1m4 4L9 9"
                    />
                </svg>
            </button>
        </div>
    );
}

export default SalePagination;
