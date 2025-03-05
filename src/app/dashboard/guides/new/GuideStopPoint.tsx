import { ISubsidiary } from "@/app/types";
import { gql, useLazyQuery } from "@apollo/client";
import React, { ChangeEvent, useEffect, useState } from "react";

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
function GuideStopPoint({ guide, setGuide, authContext, handleGuide }: any) {
    const [originSearch, setOriginSearch] = useState("");
    const [arrivalSearch, setArrivalSearch] = useState("");
    const [originSearchResults, setOriginSearchResults] = useState<
        ISubsidiary[]
    >([]);
    const [arrivalSearchResults, setArrivalSearchResults] = useState<
        ISubsidiary[]
    >([]);
    const handleOriginSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setOriginSearch(event.target.value);
    };

    const handleArrivalSearchChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setArrivalSearch(event.target.value);
    };

    const handleOriginSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedOption = event.target.value;
        const selectedData =
            searchGeographicLocationData?.searchGeographicLocationCode?.find(
                (location: ISubsidiary) =>
                    `${location.districtId} - ${location.districtDescription} | ${location.provinceDescription} | ${location.departmentDescription}` ===
                    selectedOption
            );
        if (selectedData) {
            setGuide({
                ...guide,
                guideOriginDistrictId: selectedData.districtId,
                guideOriginDistrictDescription:
                    selectedData.districtDescription,
            });
        }
    };

    const handleArrivalSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedOption = event.target.value;
        const selectedData =
            searchGeographicLocationData?.searchGeographicLocationCode?.find(
                (location: ISubsidiary) =>
                    `${location.districtId} - ${location.districtDescription} | ${location.provinceDescription} | ${location.departmentDescription}` ===
                    selectedOption
            );

        if (selectedData) {
            setGuide({
                ...guide,
                guideArrivalDistrictId: selectedData.districtId,
                guideArrivalDistrictDescription:
                    selectedData.districtDescription,
            });
        }
    };

    const [
        searchGeographicLocationCodeQuery,
        {
            loading: searchGeographicLocationLoading,
            error: searchGeographicLocationError,
            data: searchGeographicLocationData,
        },
    ] = useLazyQuery(SEARCH_GEOGRAPHIC_LOCATION_BY_PARAMETER, {
        context: authContext,
        fetchPolicy: "network-only",
        onError: (err) =>
            console.error("Error in Search Geographic Location:", err),
    });

    useEffect(() => {
        if (originSearch.length > 2) {
            searchGeographicLocationCodeQuery({
                variables: { search: originSearch },
                onCompleted: (data) => {
                    setOriginSearchResults(data.searchGeographicLocationCode);
                },
            });
        }
    }, [originSearch]);

    useEffect(() => {
        if (arrivalSearch.length > 2) {
            searchGeographicLocationCodeQuery({
                variables: { search: arrivalSearch },
                onCompleted: (data) => {
                    setArrivalSearchResults(data.searchGeographicLocationCode);
                },
            });
        }
    }, [arrivalSearch]);

    return (
        <>
            {/* PUNTO DE PARTIDA */}
            <fieldset className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                    PUNTO DE PARTIDA
                </legend>
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 ">
                    {/* UBIGEO dirección de partida */}
                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-700 dark:text-gray-200">
                            UBIGEO dirección de partida
                        </label>
                        <input
                            type="search"
                            name="originSearch"
                            maxLength={200}
                            onFocus={(e) => e.target.select()}
                            value={originSearch}
                            onChange={handleOriginSearchChange}
                            onInput={handleOriginSelect}
                            list="originList"
                            autoComplete="off"
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        <datalist id="originList">
                            {originSearchResults?.map(
                                (n: ISubsidiary, index: number) => (
                                    <option
                                        key={index}
                                        data-key={n.id}
                                        value={`${n.districtId} - ${n.districtDescription} | ${n.provinceDescription} | ${n.departmentDescription}`}
                                    />
                                )
                            )}
                        </datalist>
                    </div>
                    {/* Dirección del punto de partida */}
                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-700 dark:text-gray-200">
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
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {/* Código establecimiento Sunat */}
                    <div className="md:col-span-1">
                        <label className="text-sm text-gray-700 dark:text-gray-200">
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
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </fieldset>
            {/* PUNTO DE LLEGADA */}
            <fieldset className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <legend className="px-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                    PUNTO DE LLEGADA
                </legend>
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 ">
                    {/* UBIGEO dirección de llegada */}
                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-700 dark:text-gray-200">
                            UBIGEO dirección de llegada
                        </label>
                        <input
                            type="search"
                            name="arrivalSearch"
                            maxLength={200}
                            onFocus={(e) => e.target.select()}
                            value={arrivalSearch}
                            onChange={handleArrivalSearchChange}
                            onInput={handleArrivalSelect}
                            list="arrivalList"
                            autoComplete="off"
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        <datalist id="arrivalList">
                            {arrivalSearchResults?.map(
                                (n: ISubsidiary, index: number) => (
                                    <option
                                        key={index}
                                        data-key={n.id}
                                        value={`${n.districtId} - ${n.districtDescription} | ${n.provinceDescription} | ${n.departmentDescription}`}
                                    />
                                )
                            )}
                        </datalist>
                    </div>
                    {/* Dirección del punto de llegada */}
                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-700 dark:text-gray-200">
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
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {/* Código establecimiento Sunat */}
                    <div className="md:col-span-1">
                        <label className="text-sm text-gray-700 dark:text-gray-200">
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
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </fieldset>
        </>
    );
}

export default GuideStopPoint;
