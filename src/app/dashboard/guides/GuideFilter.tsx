import { ISubsidiary } from "@/app/types";
import Excel from "@/components/icons/Excel";
import Add from "@/components/icons/Add";
import { useRouter } from "next/navigation";
import Filter from "@/components/icons/Filter";
import { gql, useQuery } from "@apollo/client";
import React, { ChangeEvent, useEffect, useState } from "react";
const SUBSIDIARIES_QUERY = gql`
  query {
    subsidiaries {
      id
      address
      serial
      company {
        id
        businessName
      }
    }
  }
`;
function GuideFilter({
  setFilterObj,
  filterObj,
  guidesQuery,
  guidesLoading,
  authContext,
  auth,
}: any) {
  const router = useRouter();
  const [hostname, setHostname] = useState("");
  const {
    loading: subsidiariesLoading,
    error: subsidiariesError,
    data: subsidiariesData,
  } = useQuery(SUBSIDIARIES_QUERY, {
    context: authContext,
    skip: !auth?.jwtToken,
  });
  useEffect(() => {
    if (hostname == "") {
      setHostname(`${process.env.NEXT_PUBLIC_BASE_API}`);
    }
  }, [hostname]);
  const handleInputChange = (
    event: ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;
    if (name === "subsidiaryName" && event.target instanceof HTMLInputElement) {
      const dataList = event.target.list;
      if (dataList) {
        const option = Array.from(dataList.options).find(
          (option) => option.value === value
        );
        if (option) {
          const selectedId = option.getAttribute("data-key");
          setFilterObj({
            ...filterObj,
            subsidiaryId: Number(selectedId),
            subsidiaryName: value,
          });
        } else {
          setFilterObj({
            ...filterObj,
            subsidiaryId: 0,
            subsidiaryName: value,
          });
        }
      } else {
        console.log("sin datalist");
      }
    } else setFilterObj({ ...filterObj, [name]: value });
  };
  const handleClickButton = async () => {
    // Reinicializa la página a 1
    setFilterObj({
      ...filterObj,
      page: 1,
    });

    // Llama a salesQuery con la página reinicializada
    guidesQuery({
      variables: {
        subsidiaryId: Number(filterObj.subsidiaryId),
        startDate: filterObj.startDate,
        endDate: filterObj.endDate,
        documentType: filterObj.documentType,
        page: 1, // Asegúrate de pasar la página como 1 aquí también
        pageSize: Number(filterObj.pageSize),
      },
    });
    console.log({
      subsidiaryId: Number(filterObj.subsidiaryId),
      startDate: filterObj.startDate,
      endDate: filterObj.endDate,
      documentType: filterObj.documentType,
      page: 1, // Asegúrate de pasar la página como 1 aquí también
      pageSize: Number(filterObj.pageSize),
    });
  };
  useEffect(() => {
    if (auth?.user?.subsidiaryId && subsidiariesData?.subsidiaries) {
      const subsidiaryFound = subsidiariesData?.subsidiaries.find(
        (subsidiary: ISubsidiary) =>
          Number(subsidiary.id) === Number(auth?.user?.subsidiaryId)
      );
      setFilterObj({
        ...filterObj,
        subsidiaryId: auth?.user?.subsidiaryId,
        subsidiaryName:
          subsidiaryFound?.company?.businessName +
          " " +
          subsidiaryFound?.serial,
      });
    }
  }, [auth?.user?.subsidiaryId, subsidiariesData?.subsidiaries]);
  return (
    <div className="w-full mb-1 mt-2">
      <div className="flex items-center gap-2 mb-3">
        <h1 className="text-3xl font-light text-gray-800 dark:text-white">
          Guias de Remisión
        </h1>
        <button
          type="button"
          title="Crear nueva guía"
          className="btn-blue h-8 px-3 flex items-center justify-center gap-1 rounded-full hover:opacity-90 transition-all duration-200 shadow-xs hover:shadow-sm text-sm"
          onClick={() => router.push("/dashboard/guides/new")}
        >
          <Add />
          <span className="sm:inline">Emitir Guía</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>
      <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <select
          value={filterObj.documentType}
          name="documentType"
          onChange={handleInputChange}
          className="filter-form-control w-full justify-self-start"
        >
          <option value={"NA"}>Filtrar por tipo de Doc.</option>
          <option value={"09"}>GUIA DE REMISION REMITENTE</option>
          <option value={"31"}>GUÍA DE REMISIÓN TRANSPORTISTA</option>
        </select>
        {auth?.user?.isSuperuser ? (
          <>
            <input
              type="search"
              name="subsidiaryName"
              onChange={handleInputChange}
              value={filterObj.subsidiaryName}
              onFocus={(e) => e.target.select()}
              autoComplete="off"
              disabled={subsidiariesLoading}
              className="filter-form-control w-full justify-self-start"
              list="subsidiaryList"
              placeholder="Buscar por sede"
            />
            <datalist id="subsidiaryList">
              {subsidiariesData?.subsidiaries?.map(
                (n: ISubsidiary, index: number) => (
                  <option
                    key={index}
                    data-key={n.id}
                    value={`${n.company?.businessName} ${n.serial}`}
                  />
                )
              )}
            </datalist>
          </>
        ) : null}

        <input
          type="date"
          name="startDate"
          onChange={handleInputChange}
          value={filterObj.startDate}
          className="filter-form-control w-full justify-self-start"
        />

        <input
          type="date"
          name="endDate"
          onChange={handleInputChange}
          value={filterObj.endDate}
          className="filter-form-control w-full justify-self-start"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full lg:col-span-2 xl:col-span-5 mt-4">
          <button
            id="btn-search"
            type="button"
            className="btn-blue h-8 px-3 flex items-center justify-center gap-1 rounded-full hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
            onClick={handleClickButton}
            disabled={guidesLoading}
          >
            <Filter />
            Filtrar
          </button>
          <a
            href={`${hostname}/operations/export_guides_to_excel/${filterObj.subsidiaryId}/${filterObj.startDate}/${filterObj.endDate}/${filterObj.documentType}/`}
            target="_blank"
            title="Descargar EXCEL"
            download
            className="btn-green h-8 px-3 flex items-center justify-center gap-1 rounded-full hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
          >
            <Excel />
            Descarga para excel
          </a>
        </div>
      </div>
    </div>
  );
}

export default GuideFilter;
