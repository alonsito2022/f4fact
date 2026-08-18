import { ISubsidiary } from "@/app/types";
import Excel from "@/components/icons/Excel";
import Add from "@/components/icons/Add";
import { useRouter } from "next/navigation";
import Filter from "@/components/icons/Filter";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";

function GuideFilter({
  setFilterObj,
  filterObj,
  guidesQuery,
  guidesLoading,
  authContext,
  auth,
  subsidiariesData,
}: any) {
  const router = useRouter();
  const [hostname, setHostname] = useState("");
  const [subsidiarySearch, setSubsidiarySearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const subsidiaries: ISubsidiary[] =
    subsidiariesData?.subsidiariesWithGuides || [];

  const getSubsidiaryLabel = (subsidiary: ISubsidiary) =>
    subsidiary.company?.businessName || subsidiary.name || "Sin nombre";

  const filteredSubsidiaries = subsidiaries.filter((s) =>
    getSubsidiaryLabel(s).toLowerCase().includes(subsidiarySearch.toLowerCase()),
  );

  useEffect(() => {
    if (hostname === "") {
      setHostname(`${process.env.NEXT_PUBLIC_BASE_API}`);
    }
  }, [hostname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [subsidiarySearch]);

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-option]");
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  useEffect(() => {
    if (auth?.user?.subsidiaryId && subsidiaries.length > 0) {
      const subsidiaryFound = subsidiaries.find(
        (s: ISubsidiary) => Number(s.id) === Number(auth.user.subsidiaryId),
      );
      if (subsidiaryFound) {
        const label = getSubsidiaryLabel(subsidiaryFound);
        setFilterObj({
          ...filterObj,
          subsidiaryId: auth.user.subsidiaryId,
          subsidiaryName: label,
        });
        setSubsidiarySearch(label);
      }
    }
  }, [auth?.user?.subsidiaryId, subsidiaries.length]);

  const handleSubsidiarySelect = (subsidiary: ISubsidiary) => {
    const label = getSubsidiaryLabel(subsidiary);
    setFilterObj({
      ...filterObj,
      subsidiaryId: Number(subsidiary.id),
      subsidiaryName: label,
    });
    setSubsidiarySearch(label);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleClearSubsidiary = () => {
    setSubsidiarySearch("");
    setFilterObj({
      ...filterObj,
      subsidiaryId: 0,
      subsidiaryName: "",
    });
    inputRef.current?.focus();
  };

  const handleSubsidiaryKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || !filteredSubsidiaries.length) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setShowDropdown(true);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredSubsidiaries.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSubsidiaries.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredSubsidiaries.length) {
          handleSubsidiarySelect(filteredSubsidiaries[selectedIndex]);
        } else if (filteredSubsidiaries.length === 1) {
          handleSubsidiarySelect(filteredSubsidiaries[0]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    setFilterObj({ ...filterObj, [name]: value });
  };

  const handleClickButton = async () => {
    setFilterObj({ ...filterObj, page: 1 });
    guidesQuery({
      variables: {
        subsidiaryId: Number(filterObj.subsidiaryId),
        startDate: filterObj.startDate,
        endDate: filterObj.endDate,
        documentType: filterObj.documentType,
        page: 1,
        pageSize: Number(filterObj.pageSize),
      },
    });
  };

  return (
    <div className="w-full mb-2 mt-3 px-1">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-5">
        <div className="relative flex-shrink-0">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-sm opacity-60" />
          <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
              Guías de Remisión
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Gestiona y consulta tus guías de remisión
            </p>
          </div>
          <button
            type="button"
            title="Crear nueva guía"
            className="group relative inline-flex items-center justify-center gap-2 px-4 py-2 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all duration-300 ease-out whitespace-nowrap"
            onClick={() => router.push("/dashboard/guides/new")}
          >
            <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Emitir Guía
          </button>
        </div>
      </div>

      <div className="relative z-20 bg-white dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60" />

        <div className="p-4">
          <div className="grid grid-cols-12 gap-3">
            <div className="group flex flex-col gap-1.5 min-w-0 col-span-3">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Tipo de Documento
              </label>
              <div className="relative">
                <select
                  value={filterObj.documentType}
                  name="documentType"
                  onChange={handleInputChange}
                  className="filter-form-control w-full min-w-0 h-10 sm:h-11 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 px-3 pr-10 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 ease-out appearance-none cursor-pointer"
                >
                  <option value="NA">Todos los tipos</option>
                  <option value="09">Guía de Remisión Remitente</option>
                  <option value="31">Guía de Remisión Transportista</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {auth?.user?.isSuperuser && (
              <div className="group relative z-30 flex flex-col gap-1.5 min-w-0 col-span-3">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Sede
                </label>
                <div className="relative" ref={dropdownRef}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      ref={inputRef}
                      type="text"
                      value={subsidiarySearch}
                      onChange={(e) => {
                        setSubsidiarySearch(e.target.value);
                        setShowDropdown(true);
                        setFilterObj({
                          ...filterObj,
                          subsidiaryId: 0,
                          subsidiaryName: e.target.value,
                        });
                      }}
                      onKeyDown={handleSubsidiaryKeyDown}
                      onFocus={() => setShowDropdown(true)}
                      onClick={() => setShowDropdown(true)}
                      autoComplete="off"
                      placeholder="Buscar sede..."
                      className="filter-form-control w-full min-w-0 h-10 sm:h-11 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 pl-10 pr-10 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 ease-out"
                    />
                    {subsidiarySearch && (
                      <button
                        type="button"
                        onClick={handleClearSubsidiary}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-150"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  {showDropdown && (
                    <div
                      ref={listRef}
                      className="absolute left-0 right-0 top-full z-[100] mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/40 max-h-72 overflow-y-auto"
                    >
                      {filteredSubsidiaries.length > 0 ? (
                        filteredSubsidiaries.map(
                          (s: ISubsidiary, index: number) => (
                            <div
                              key={s.id}
                              data-option
                              className={`px-4 py-3 cursor-pointer text-sm transition-all duration-150 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0 ${
                                index === selectedIndex
                                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-200"
                                  : "hover:bg-gray-50 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-200"
                              }`}
                              onClick={() => handleSubsidiarySelect(s)}
                              onMouseEnter={() => setSelectedIndex(index)}
                            >
                              <div
                                className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                                  index === selectedIndex
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                                }`}
                              >
                                {(s.company?.businessName || "S")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate">
                                  {getSubsidiaryLabel(s)}
                                </div>
                              </div>
                            </div>
                          ),
                        )
                      ) : (
                        <div className="px-4 py-8 text-sm text-gray-400 dark:text-gray-500 text-center flex flex-col items-center gap-2">
                          <svg
                            className="w-10 h-10 text-gray-300 dark:text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          No se encontraron sedes
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="group flex flex-col gap-1.5 min-w-0 col-span-3">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Fecha Inicio
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="startDate"
                  onChange={handleInputChange}
                  value={filterObj.startDate}
                  className="filter-form-control w-full min-w-0 h-10 sm:h-11 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 px-2.5 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 ease-out"
                />
              </div>
            </div>

            <div className="group flex flex-col gap-1.5 min-w-0 col-span-3">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 text-rose-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Fecha Fin
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="endDate"
                  onChange={handleInputChange}
                  value={filterObj.endDate}
                  className="filter-form-control w-full min-w-0 h-10 sm:h-11 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 px-2.5 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 ease-out"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-row flex-wrap items-center justify-end gap-3 mt-5 pt-5 border-t border-gray-100 dark:border-gray-700/60">
            <button
              id="btn-search"
              type="button"
              className="group relative inline-flex items-center justify-center gap-2 h-10 sm:h-11 px-5 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-normal text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 ease-out flex-1 sm:flex-none min-w-[120px]"
              onClick={handleClickButton}
              disabled={guidesLoading}
            >
              <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {guidesLoading ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              )}
              Filtrar
            </button>
            <a
              href={`${hostname}/operations/export_guides_to_excel/${filterObj.subsidiaryId}/${filterObj.startDate}/${filterObj.endDate}/${filterObj.documentType}/`}
              target="_blank"
              title="Descargar EXCEL"
              download
              className="group relative inline-flex items-center justify-center gap-2 h-10 sm:h-11 px-5 sm:px-6 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-normal text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:from-emerald-700 hover:to-green-700 active:scale-[0.98] transition-all duration-300 ease-out flex-1 sm:flex-none min-w-[120px]"
            >
              <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Excel />
              Descarga para Excel
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuideFilter;
