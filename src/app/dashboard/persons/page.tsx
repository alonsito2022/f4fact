"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { gql, useLazyQuery } from "@apollo/client";
import { useAuth } from "@/components/providers/AuthProvider";
import PersonList from "./PersonList";
import PersonFilter from "./PersonFilter";
import { IUser } from "@/app/types";
import PersonForm from "./PersonForm";
import { Modal } from "flowbite";

const initialStatePerson = {
    id: 0,
    names: "",
    code: "",
    documentType: "6",
    documentNumber: "",
    address: "",
    email: "",
    phone: "",
    observation: "",
    isEnabled: true,
    isClient: true,
    isSupplier: false,
    country: "PE",
    districtId: "040101",
    shortName: "",
    driverLicense: "",
};

const initialStatePersonFilterObj = {
    subsidiaryId: "",
    subsidiaryName: "",
    isSuperuser: false,
};

const CUSTOMERS_QUERY = gql`
    query ($subsidiaryId: Int!) {
        allCustomers(subsidiaryId: $subsidiaryId) {
            id
            names
            documentType
            documentTypeReadable
            documentNumber
            address
            email
            phone
            observation
        }
    }
`;

function PersonPage() {
    const [personFilterObj, setPersonFilterObj] = useState(
        initialStatePersonFilterObj
    );
    const auth = useAuth();

    const [person, setPerson] = useState(initialStatePerson);
    const [modalPerson, setModalPerson] = useState<Modal | any>(null);

    const authContext = useMemo(
        () => ({
            headers: {
                "Content-Type": "application/json",
                Authorization: auth?.jwtToken ? `JWT ${auth.jwtToken}` : "",
            },
        }),
        [auth?.jwtToken]
    );

    const getVariables = () => ({
        subsidiaryId: Number(personFilterObj?.subsidiaryId),
    });

    const [
        customersQuery,
        {
            loading: filteredCustomersLoading,
            error: filteredCustomersError,
            data: filteredCustomersData,
        },
    ] = useLazyQuery(CUSTOMERS_QUERY, {
        context: authContext,
        variables: getVariables(),
        fetchPolicy: "network-only",
        // onCompleted: (data) => {},
        onError: (err) => console.error("Error in Clients:", err),
    });

    const fetchCustomers = () => {
        customersQuery();
    };

    useEffect(() => {
        if (auth?.user) {
            const user = auth?.user as IUser;
            setPersonFilterObj((prev) => ({
                ...prev,
                subsidiaryId: user.subsidiaryId! || "0",
                subsidiaryName: user.subsidiaryName! || "",
                isSuperuser: user.isSuperuser ?? false,
            }));
        }
    }, [auth?.user]);

    useEffect(() => {
        if (auth?.jwtToken && Number(personFilterObj.subsidiaryId) > 0) {
            fetchCustomers();
        }
    }, [auth?.jwtToken, personFilterObj.subsidiaryId]);

    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    const displayedCustomers = useMemo(() => {
        if (!selectedCustomer) return filteredCustomersData?.allCustomers;
        return filteredCustomersData?.allCustomers.filter(
            (customer: any) => customer.id === selectedCustomer.id
        );
    }, [filteredCustomersData?.allCustomers, selectedCustomer]);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-800">
            <div className="container mx-auto pb-16">
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-1"></div>
                    <div className="col-span-10">
                        <PersonFilter
                            filteredCustomers={
                                filteredCustomersData?.allCustomers
                            }
                            onCustomerSelect={setSelectedCustomer}
                            setPerson={setPerson}
                            initialStatePerson={initialStatePerson}
                            modalPerson={modalPerson}
                            setModalPerson={setModalPerson}
                        />
                        <PersonList
                            filteredCustomers={displayedCustomers}
                            authContext={authContext}
                            person={person}
                            setPerson={setPerson}
                            modalPerson={modalPerson}
                            setModalPerson={setModalPerson}
                        />
                    </div>
                    <div className="col-span-1"></div>
                </div>
            </div>
            <PersonForm
                modalPerson={modalPerson}
                setModalPerson={setModalPerson}
                person={person}
                setPerson={setPerson}
                initialStatePerson={initialStatePerson}
                auth={auth}
                jwtToken={auth?.jwtToken}
                authContext={authContext}
                CUSTOMERS_QUERY={CUSTOMERS_QUERY}
                getVariables={getVariables}
            />
        </div>
    );
}

export default PersonPage;
