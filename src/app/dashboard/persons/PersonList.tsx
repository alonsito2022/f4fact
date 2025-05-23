import { gql, useLazyQuery } from "@apollo/client";
import React, { useCallback, useState } from "react";

const PERSON_QUERY = gql`
  query ($clientId: ID!) {
    clientById(clientId: $clientId) {
      id
      code
      names
      shortName
      documentType
      documentNumber
      phone
      email
      address
      driverLicense
      observation
      isEnabled
      isClient
      isSupplier
    }
  }
`;

function PersonList({
  filteredCustomers,
  authContext,
  modalPerson,
  setPerson,
  person,
  setModalPerson,
}: any) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const recordsPerPage = 20;
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = filteredCustomers?.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(
    (filteredCustomers?.length || 0) / recordsPerPage
  );

  const [
    personQuery,
    {
      loading: foundPersonLoading,
      error: foundPersonError,
      data: foundPersonData,
    },
  ] = useLazyQuery(PERSON_QUERY, {
    // onCompleted(data) {
    //   console.log("Data", data);
    // },
    // onError(error) {
    //   console.error("Error al obtener el cliente:", error);
    // },
    fetchPolicy: "network-only",
  });

  const handleEditPerson = useCallback(
    async (clientId: number) => {
      try {
        const { data } = await personQuery({
          variables: { clientId: Number(clientId) },
          context: authContext,
        });
        const personFound = data.clientById;
        console.log("Persona encontrada:", personFound);
        const updatedProduct = {
          id: personFound?.id ?? 0,
          code: personFound?.code ?? "", // Agrega esta línea para obtener el code del objeto personFound y asignarlo a la propiedad code del objeto updatedProduct
          names: personFound?.names ?? "",
          shortName: personFound?.shortName ?? "", // Agrega esta línea para obtener el shortName del objeto personFound y asignarlo a la propiedad shortName del objeto updatedProduct
          documentType: personFound?.documentType ?? "",
          documentNumber: personFound?.documentNumber ?? "",
          address: personFound?.address ?? "",
          email: personFound?.email ?? "",
          phone: personFound?.phone ?? "",
          driverLicense: personFound?.driverLicense ?? "", // Agrega esta línea para obtener el driverLicense del objeto personFound y asignarlo a la propiedad driverLicense del objeto updatedProduct
          observation: personFound?.observation ?? "",
          isEnabled: personFound?.isEnabled ?? false,
          isClient: personFound?.isClient ?? false,
          isSupplier: personFound?.isSupplier ?? false,
        };
        setPerson(updatedProduct);
        modalPerson.show();
      } catch (error) {
        console.error("Error al obtener el cliente:", error);
      }
    },
    [personQuery, setPerson, modalPerson, authContext]
  );

  if (foundPersonLoading) return <p>Loading...</p>;
  if (foundPersonError) return <p>Error: {foundPersonError.message}</p>;

  return (
    <>
      <div className="p-2 flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-gray-500 hover:text-blue-600 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            « Previous
          </button>
          {totalPages > 0 && (
            <>
              {/* First page */}
              <button
                onClick={() => setCurrentPage(1)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-xs transition-colors ${
                  currentPage === 1
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:text-blue-600"
                }`}
              >
                1
              </button>

              {/* Left ellipsis */}
              {currentPage > 3 && <span className="text-gray-500">...</span>}

              {/* Middle pages */}
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                if (
                  pageNumber !== 1 &&
                  pageNumber !== totalPages &&
                  pageNumber >= currentPage - 1 &&
                  pageNumber <= currentPage + 1
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-xs transition-colors ${
                        currentPage === pageNumber
                          ? "bg-blue-600 text-white"
                          : "text-gray-500 hover:text-blue-600"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                return null;
              })}

              {/* Right ellipsis */}
              {currentPage < totalPages - 2 && (
                <span className="text-gray-500">...</span>
              )}

              {/* Last page */}
              {totalPages > 1 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-xs transition-colors ${
                    currentPage === totalPages
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 hover:text-blue-600"
                  }`}
                >
                  {totalPages}
                </button>
              )}
            </>
          )}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-gray-500 hover:text-blue-600 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next »
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="p-4 text-[14px] font-extrabold text-left text-black-500 dark:text-gray-400"
              >
                Tipo
              </th>
              <th
                scope="col"
                className="p-4 text-[14px] font-extrabold text-left text-black-800 dark:text-gray-400"
              >
                Número
              </th>
              <th
                scope="col"
                className="p-4 text-[14px] font-extrabold text-left text-black-800 dark:text-gray-400"
              >
                Denominación / Nombres
              </th>
              <th
                scope="col"
                className="p-4 text-[14px] font-extrabold text-center text-black-800 dark:text-gray-400"
              >
                Dirección Fiscal
              </th>
              <th
                scope="col"
                className="p-4 text-[14px] font-extrabold text-left text-black-800 dark:text-gray-400"
              >
                Emails/Teléfonos
              </th>
              <th
                scope="col"
                className="p-4 text-[14px] font-extrabold text-left text-black-800 dark:text-gray-400"
              ></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {records?.map((item: any, index: number) => (
              <tr
                key={item.id}
                className={`hover:bg-blue-100 dark:hover:bg-blue-50/10 transition-all duration-200 cursor-pointer ${
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-800"
                    : "bg-gray-50 dark:bg-gray-800/50"
                }`}
              >
                <td className="p-4 text-[13px] text-gray-900 dark:text-gray-300">
                  {item.documentTypeReadable}
                </td>
                <td className="p-4 text-[13px] text-gray-900 dark:text-gray-300">
                  {item.documentNumber}
                </td>
                <td className="p-4 text-[13px] text-gray-900 dark:text-gray-300 font-medium">
                  {item.names}
                </td>
                <td className="p-4 text-[13px] text-gray-900 dark:text-gray-300">
                  {item.address}
                </td>
                <td className="p-4 text-[13px] text-gray-900 dark:text-gray-300">
                  <div>{item.email}</div>
                  <div className="text-[13px] text-gray-500 dark:text-gray-400">
                    {item.phone}
                  </div>
                </td>
                <td className="p-4 text-[13px] text-gray-900 dark:text-gray-300 relative">
                  <button
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === item.id ? null : item.id
                      )
                    }
                    className="text-blue-600 hover:text-blue-700 transition-colors text-xs dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Opciones
                  </button>
                  {activeDropdown === item.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 dark:bg-gray-800">
                      <button
                        onClick={() => {
                          handleEditPerson(item.id);
                          setActiveDropdown(null);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-blue-500 hover:text-white rounded-t-md dark:text-gray-300 dark:hover:text-white"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          console.log("Delete", item.id);
                          setActiveDropdown(null);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-red-500 hover:text-white rounded-b-md dark:text-gray-300 dark:hover:text-white"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <td colSpan={6}>
                <div className="p-2 flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-gray-500 hover:text-blue-600 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      « Previous
                    </button>
                    {totalPages > 0 && (
                      <>
                        <button
                          onClick={() => setCurrentPage(1)}
                          className={`w-8 h-8 flex items-center justify-center rounded-full text-xs transition-colors ${
                            currentPage === 1
                              ? "bg-blue-600 text-white"
                              : "text-gray-500 hover:text-blue-600"
                          }`}
                        >
                          1
                        </button>

                        {currentPage > 3 && (
                          <span className="text-gray-500">...</span>
                        )}

                        {[...Array(totalPages)].map((_, index) => {
                          const pageNumber = index + 1;
                          if (
                            pageNumber !== 1 &&
                            pageNumber !== totalPages &&
                            pageNumber >= currentPage - 1 &&
                            pageNumber <= currentPage + 1
                          ) {
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => setCurrentPage(pageNumber)}
                                className={`w-8 h-8 flex items-center justify-center rounded-full text-xs transition-colors ${
                                  currentPage === pageNumber
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-500 hover:text-blue-600"
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          }
                          return null;
                        })}

                        {currentPage < totalPages - 2 && (
                          <span className="text-gray-500">...</span>
                        )}

                        {totalPages > 1 && (
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            className={`w-8 h-8 flex items-center justify-center rounded-full text-xs transition-colors ${
                              currentPage === totalPages
                                ? "bg-blue-600 text-white"
                                : "text-gray-500 hover:text-blue-600"
                            }`}
                          >
                            {totalPages}
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-gray-500 hover:text-blue-600 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next »
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="mt-16 text-center text-xs text-gray-600 dark:text-gray-400">
        <p className="font-semibold">
          SISTEMAS DE TECNOLOGIA 4 SOLUCIONES S.A.C.
        </p>
        <p>www.4soluciones.net</p>
      </div>
    </>
  );
}

export default PersonList;
