import { ISubsidiary } from "@/app/types";
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
function RetentionFilter({
  setFilterObj,
  filterObj,
  retentionsQuery,
  retentionsLoading,
  authContext,
  auth,
}: any) {
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
    >,
  ) => {
    const { name, value } = event.target;
    if (name === "subsidiaryName" && event.target instanceof HTMLInputElement) {
      const dataList = event.target.list;
      if (dataList) {
        const option = Array.from(dataList.options).find(
          (option) => option.value === value,
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
    retentionsQuery({
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
          Number(subsidiary.id) === Number(auth?.user?.subsidiaryId),
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
    <div className="flex flex-nowrap items-end gap-2 sm:gap-3 w-full min-w-0 overflow-x-auto pb-0.5">
      {auth?.user?.isSuperuser && (
        <div className="flex flex-col gap-1 min-w-[11rem] flex-1 max-w-md shrink-0">
          <label className="text-xs text-gray-500 ml-1">Sede</label>
          <input
            type="search"
            name="subsidiaryName"
            onChange={handleInputChange}
            value={filterObj.subsidiaryName}
            onFocus={(e) => e.target.select()}
            autoComplete="off"
            disabled={subsidiariesLoading}
            className="filter-form-control w-full"
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
              ),
            )}
          </datalist>
        </div>
      )}

      <div className="flex flex-col gap-1 w-[9.5rem] sm:w-[10rem] shrink-0">
        <label className="text-xs text-gray-500 ml-1">Fecha Inicio</label>
        <input
          type="date"
          name="startDate"
          onChange={handleInputChange}
          value={filterObj.startDate}
          className="filter-form-control w-full"
        />
      </div>

      <div className="flex flex-col gap-1 w-[9.5rem] sm:w-[10rem] shrink-0">
        <label className="text-xs text-gray-500 ml-1">Fecha Fin</label>
        <input
          type="date"
          name="endDate"
          onChange={handleInputChange}
          value={filterObj.endDate}
          className="filter-form-control w-full"
        />
      </div>

      <div className="shrink-0">
        <button
          id="btn-search"
          type="button"
          className="btn-blue inline-flex items-center justify-center gap-2 h-10 px-4 py-2 text-sm rounded-md whitespace-nowrap"
          onClick={handleClickButton}
          disabled={retentionsLoading}
        >
          <Filter className="text-[1.05em] shrink-0" />
          Filtrar
        </button>
      </div>
    </div>
  );
}

export default RetentionFilter;
