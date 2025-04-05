import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { toast } from "react-toastify";
import Save from "@/components/icons/Save";
import { Modal, ModalOptions } from "flowbite";
import {
    DocumentNode,
    gql,
    useLazyQuery,
    useMutation,
    useQuery,
} from "@apollo/client";
const GET_CLIENT_BY_ID = gql`
    query GetClientById($clientId: ID!) {
        clientById(clientId: $clientId) {
            id
            names
            shortName
            email
            phone
            address
            country
            documentType
            documentNumber
            isEnabled
            isClient
            isSupplier
            economicActivityMain
        }
    }
`;
const UPDATE_PERSON = gql`
    mutation UpdatePerson(
        $id: ID!
        $names: String
        $shortName: String
        $phone: String
        $email: String
        $address: String
        $country: String
        $districtId: String
        $documentType: String
        $documentNumber: String
        $isEnabled: Boolean
        $isSupplier: Boolean
        $isClient: Boolean
        $economicActivityMain: Int
    ) {
        updatePerson(
            id: $id
            names: $names
            shortName: $shortName
            phone: $phone
            email: $email
            address: $address
            country: $country
            districtId: $districtId
            documentType: $documentType
            documentNumber: $documentNumber
            isEnabled: $isEnabled
            isSupplier: $isSupplier
            isClient: $isClient
            economicActivityMain: $economicActivityMain
        ) {
            success
            message
            person {
                id
                names
                shortName
                email
                phone
                address
                isEnabled
            }
        }
    }
`;

const COUNTRIES_QUERY = gql`
    query {
        allCountries {
            code
            name
        }
    }
`;

const DOCUMENT_TYPES_QUERY = gql`
    query {
        allDocumentTypes {
            code
            name
        }
    }
`;

const ECONOMIC_ACTIVITIES_QUERY = gql`
    query {
        allEconomicActivities {
            code
            name
        }
    }
`;

const DEPARTMENTS_QUERY = gql`
    query {
        departments {
            id
            description
        }
    }
`;

const PROVINCES_QUERY = gql`
    query ($departmentId: String!) {
        provincesByDepartmentId(departmentId: $departmentId) {
            id
            description
        }
    }
`;

const DISTRICTS_QUERY = gql`
    query ($provinceId: String!) {
        districtsByProvinceId(provinceId: $provinceId) {
            id
            description
        }
    }
`;

function ClientEdit() {
    return <div></div>;
}

export default ClientEdit;
