import { gql, useLazyQuery } from "@apollo/client";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const SEARCH_GEOGRAPHIC_LOCATION_BY_PARAMETER = gql`
  query ($search: String!) {
    searchGeographicLocationCode(search: $search) {
      districtId
      districtDescription
      provinceDescription
      departmentDescription
    }
  }
`;

type GeographicLocation = {
  districtId: string;
  districtDescription: string;
  provinceDescription: string;
  departmentDescription: string;
};

const inputClassName =
  "w-full h-10 sm:h-11 px-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200";

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const re = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "ig",
  );
  const parts = text.split(re);
  return parts.map((part, i) =>
    re.test(part) ? (
      <span
        key={i}
        className="text-indigo-600 dark:text-indigo-400 font-semibold"
      >
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function locationLabel(location: GeographicLocation) {
  return `${location.districtId} - ${location.districtDescription} | ${location.provinceDescription} | ${location.departmentDescription} |`;
}

function UbigeoAutocomplete({
  label,
  inputName,
  selectedId,
  selectedDescription,
  onSelect,
  onClear,
  authContext,
  onOpenChange,
}: {
  label: string;
  inputName: string;
  selectedId: string;
  selectedDescription: string;
  onSelect: (location: GeographicLocation) => void;
  onClear: () => void;
  authContext: any;
  onOpenChange?: (open: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);

  const [searchLocation, { loading, data }] = useLazyQuery(
    SEARCH_GEOGRAPHIC_LOCATION_BY_PARAMETER,
    {
      context: authContext,
      fetchPolicy: "network-only",
      onError: (err) =>
        console.error("Error in Search Geographic Location:", err),
    },
  );

  const options: GeographicLocation[] = useMemo(
    () => data?.searchGeographicLocationCode || [],
    [data],
  );

  const isSelected = Boolean(selectedId);

  useEffect(() => {
    if (didInit.current || !selectedId) return;
    didInit.current = true;
    setSearch((current) =>
      current
        ? current
        : selectedDescription
          ? `${selectedId} - ${selectedDescription}`
          : selectedId,
    );
  }, [selectedId, selectedDescription]);

  useEffect(() => {
    onOpenChange?.(showDropdown);
  }, [showDropdown, onOpenChange]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const term = search.trim();
    if (term.length <= 2) return;
    const timeout = setTimeout(() => {
      searchLocation({ variables: { search: term } });
    }, 160);
    return () => clearTimeout(timeout);
  }, [search, searchLocation]);

  const selectLocation = useCallback(
    (location: GeographicLocation) => {
      setSearch(locationLabel(location));
      onSelect(location);
      setShowDropdown(false);
      setHighlightedIndex(-1);
    },
    [onSelect],
  );

  const clearLocation = () => {
    setSearch("");
    onClear();
    setHighlightedIndex(-1);
    setShowDropdown(true);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setHighlightedIndex(-1);
    setShowDropdown(true);
    if (isSelected) onClear();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      !showDropdown &&
      (event.key === "ArrowDown" || event.key === "ArrowUp")
    ) {
      setShowDropdown(true);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) =>
        prev < options.length - 1 ? prev + 1 : prev,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (event.key === "Enter") {
      if (highlightedIndex >= 0 && options[highlightedIndex]) {
        event.preventDefault();
        selectLocation(options[highlightedIndex]);
      }
    } else if (event.key === "Escape") {
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };

  const showHint = search.trim().length < 3;
  const showEmpty = !loading && !showHint && options.length === 0;

  return (
    <div className="relative md:col-span-2" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="search"
          name={inputName}
          id={inputName}
          maxLength={200}
          value={search}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={(e) => {
            e.target.select();
            setShowDropdown(true);
          }}
          placeholder="Buscar ubigeo..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          data-lpignore="true"
          data-1p-ignore="true"
          data-form-type="other"
          className={`${inputClassName} ${
            isSelected
              ? "border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-500/5"
              : ""
          } ${search && loading ? "pr-16" : search || loading ? "pr-10" : ""}`}
        />
        {loading && (
          <span
            className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${
              search ? "right-10" : "right-3"
            }`}
          >
            <svg
              className="w-4 h-4 animate-spin text-blue-500"
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
          </span>
        )}
        {search && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              clearLocation();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:bg-gray-200/80 dark:hover:bg-gray-600/60 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Limpiar"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      {showDropdown && (
        <div className="absolute z-50 mt-1.5 w-full left-0 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
          <div className="max-h-64 overflow-y-auto py-1">
            {loading && options.length === 0 && (
              <p className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
                Buscando ubigeo...
              </p>
            )}
            {showHint && !loading && (
              <p className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
                Escribe al menos 3 caracteres
              </p>
            )}
            {showEmpty && (
              <p className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
                No se encontraron coincidencias
              </p>
            )}
            {options.map((location, index) => {
              const active = highlightedIndex === index;
              const optionLabel = locationLabel(location);
              return (
                <button
                  type="button"
                  key={`${location.districtId}-${index}`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectLocation(location);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm ${
                    active
                      ? "bg-blue-50 dark:bg-blue-500/10 text-gray-900 dark:text-gray-100"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {highlightMatch(optionLabel, search)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function GuideStopPoint({ guide, setGuide, authContext, handleGuide }: any) {
  const [originOpen, setOriginOpen] = useState(false);
  const [arrivalOpen, setArrivalOpen] = useState(false);

  return (
    <>
      <div
        className={`relative overflow-visible ${originOpen ? "z-30" : "z-10"}`}
      >
        <div className="bg-white dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] overflow-visible">
          <div className="h-1 rounded-t-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60" />
          <div className="p-5 sm:p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-5">
              Punto de Partida
            </h2>
            <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
              <UbigeoAutocomplete
                label="UBIGEO dirección de partida"
                inputName="originSearch"
                selectedId={guide.guideOriginDistrictId || ""}
                selectedDescription={guide.guideOriginDistrictDescription || ""}
                authContext={authContext}
                onOpenChange={setOriginOpen}
                onSelect={(location) => {
                  setGuide((prev: any) => ({
                    ...prev,
                    guideOriginDistrictId: location.districtId,
                    guideOriginDistrictDescription:
                      location.districtDescription,
                  }));
                }}
                onClear={() => {
                  setGuide((prev: any) => ({
                    ...prev,
                    guideOriginDistrictId: "",
                    guideOriginDistrictDescription: "",
                  }));
                }}
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dirección del punto de partida
                </label>
                <input
                  type="text"
                  name="guideOriginAddress"
                  maxLength={200}
                  onFocus={(e) => e.target.select()}
                  value={guide.guideOriginAddress}
                  onChange={handleGuide}
                  autoComplete="off"
                  className={inputClassName}
                />
              </div>
              {guide.guideReasonTransfer === "04" && (
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Código establecimiento Sunat
                  </label>
                  <input
                    type="text"
                    name="guideOriginSerial"
                    maxLength={4}
                    onFocus={(e) => e.target.select()}
                    value={guide.guideOriginSerial}
                    onChange={handleGuide}
                    autoComplete="off"
                    className={inputClassName}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`relative overflow-visible ${arrivalOpen ? "z-30" : "z-10"}`}
      >
        <div className="bg-white dark:bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] overflow-visible">
          <div className="h-1 rounded-t-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60" />
          <div className="p-5 sm:p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-5">
              Punto de Llegada
            </h2>
            <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
              <UbigeoAutocomplete
                label="UBIGEO dirección de llegada"
                inputName="arrivalSearch"
                selectedId={guide.guideArrivalDistrictId || ""}
                selectedDescription={
                  guide.guideArrivalDistrictDescription || ""
                }
                authContext={authContext}
                onOpenChange={setArrivalOpen}
                onSelect={(location) => {
                  setGuide((prev: any) => ({
                    ...prev,
                    guideArrivalDistrictId: location.districtId,
                    guideArrivalDistrictDescription:
                      location.districtDescription,
                  }));
                }}
                onClear={() => {
                  setGuide((prev: any) => ({
                    ...prev,
                    guideArrivalDistrictId: "",
                    guideArrivalDistrictDescription: "",
                  }));
                }}
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dirección del punto de llegada
                </label>
                <input
                  type="text"
                  name="guideArrivalAddress"
                  maxLength={200}
                  onFocus={(e) => e.target.select()}
                  value={guide.guideArrivalAddress}
                  onChange={handleGuide}
                  autoComplete="off"
                  className={inputClassName}
                />
              </div>
              {guide.guideReasonTransfer === "04" && (
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Código establecimiento Sunat
                  </label>
                  <input
                    type="text"
                    name="guideArrivalSerial"
                    maxLength={4}
                    onFocus={(e) => e.target.select()}
                    value={guide.guideArrivalSerial}
                    onChange={handleGuide}
                    autoComplete="off"
                    className={inputClassName}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default GuideStopPoint;
