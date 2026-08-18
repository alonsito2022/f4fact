import React from "react";

interface GuidePaginationProps {
  filterObj: any;
  setFilterObj: (obj: any) => void;
  guidesQuery: (options: any) => void;
  guidesData: any;
}

function GuidePagination({
  filterObj,
  setFilterObj,
  guidesQuery,
  guidesData,
}: GuidePaginationProps) {
  const totalPages = guidesData?.allGuides?.totalNumberOfPages || 0;
  const totalRecords = guidesData?.allGuides?.totalNumberOfSales || 0;
  const currentPage = filterObj.page || 1;
  const pageSize = filterObj.pageSize || 50;

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setFilterObj({ ...filterObj, page });
    guidesQuery({
      variables: {
        subsidiaryId: Number(filterObj.subsidiaryId),
        startDate: filterObj.startDate,
        endDate: filterObj.endDate,
        documentType: filterObj.documentType,
        page,
        pageSize: Number(pageSize),
      },
    });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  if (totalPages === 0) return null;

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 my-4 px-2">
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Mostrando{" "}
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          {startRecord}
        </span>{" "}
        -{" "}
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          {endRecord}
        </span>{" "}
        de{" "}
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          {totalRecords}
        </span>{" "}
        registros
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => goToPage(1)}
          disabled={currentPage <= 1}
          className="px-2.5 py-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors duration-150"
          title="Primera pagina"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-2.5 py-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors duration-150"
          title="Pagina anterior"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {getPageNumbers().map((pageNum, idx) =>
          typeof pageNum === "string" ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 py-1.5 text-xs text-gray-400 dark:text-gray-500"
            >
              ...
            </span>
          ) : (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              className={`min-w-[32px] px-2 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${
                pageNum === currentPage
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              }`}
            >
              {pageNum}
            </button>
          )
        )}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-2.5 py-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors duration-150"
          title="Pagina siguiente"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={() => goToPage(totalPages)}
          disabled={currentPage >= totalPages}
          className="px-2.5 py-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors duration-150"
          title="Ultima pagina"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default GuidePagination;
