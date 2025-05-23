import React, { useState } from "react";

function PersonFilter({
  filteredCustomers,
  onCustomerSelect,
  setPerson,
  initialStatePerson,
  modalPerson,
}: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const filteredResults = filteredCustomers?.filter((customer: any) =>
    customer.names.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
    if (!e.target.value) {
      onCustomerSelect(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filteredResults?.length) return;

    if (e.key === "Enter" && selectedIndex >= 0) {
      const selected = filteredResults[selectedIndex];
      setSearchTerm(selected.names);
      setShowSuggestions(false);
      onCustomerSelect(selected);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }
  };

  const handleSelectCustomer = (customer: any) => {
    setSearchTerm(customer.names);
    setShowSuggestions(false);
    onCustomerSelect(customer);
  };

  return (
    <>
      <div className="w-full mb-1 mt-2">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-light text-gray-800 dark:text-white">
            Clientes y Proveedores
          </h1>
          <button
            className="px-3 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-xs"
            onClick={() => {
              modalPerson.show();
              setPerson(initialStatePerson);
            }}
          >
            Nuevo Clientes/Proveedor
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gestiona tu lista de clientes y proveedores de manera eficiente
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              placeholder="Buscar entidad..."
              className="w-full pl-10 pr-4 py-1.5 text-xs rounded-full border border-gray-200 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
            />
            {searchTerm && showSuggestions && (
              <div className="absolute w-full mt-1 max-h-60 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg z-10 dark:bg-gray-700 dark:border-gray-600">
                {filteredResults?.map((customer: any, index: number) => (
                  <div
                    key={customer.id}
                    className={`px-4 py-2 cursor-pointer text-sm dark:text-white ${
                      index === selectedIndex
                        ? "bg-gray-100 dark:bg-gray-600"
                        : "hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    {customer.names}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-xs flex items-center gap-2">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Descargar Excel
          </button>
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-xs flex items-center gap-2">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Top 10 Clientes
          </button>
        </div>
      </div>
    </>
  );
}

export default PersonFilter;
