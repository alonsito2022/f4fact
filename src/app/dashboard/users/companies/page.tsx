"use client"
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { ICompany } from '@/app/types';
import { toast } from "react-toastify";
import { it } from "node:test";
import CompanyList from "./CompanyList"
import CompanyModal from "./CompanyModal"
import { Modal, ModalOptions } from 'flowbite'
import Breadcrumb from "@/components/Breadcrumb";
import CompanyFilter from "./CompanyFilter";
const initialState = {
  id: 0,
  typeDoc: "6",
  doc: "",
  shortName: "",
  businessName: "",
  address: "",
  email: "",
  phone: "",
  logo: "",
  userSol: "",
  keySol: "",
  limit: 500,
  emissionInvoiceWithPreviousDate: 0,
  emissionReceiptWithPreviousDate: 0,
  includeIgv: false,
  percentageIgv: 18,
  isEnabled: false,
  isProduction: false,
  productionDate: "",
  disabledDate: "",
  passwordSignature: "",
  certification: null,
  certificationExpirationDate: "",
  withStock: false,
  catalog: false,
  invoiceF: false,
  invoiceB: false,
  guide: false,
  app: false
}
function CompanyPage() {
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [modal, setModal] = useState<Modal | any>(null);
  const [company, setCompany] = useState(initialState);
  const [searchTerm, setSearchTerm] = useState<string>('');
  async function fetchCompanies() {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
                {
                    companies {
                        id
                        typeDoc
                        doc
                        businessName
                        address
                        email
                        phone
                        shortName
                        logo
                        isProduction
                        isEnabled
                        limit
                        country
                        userSol
                        keySol
                        emissionInvoiceWithPreviousDate
                        emissionReceiptWithPreviousDate
                        includeIgv
                        percentageIgv
                        productionDate
                        disabledDate
                    }
                }
            `
      })
    })
      .then(res => res.json())
      .then(data => {
        setCompanies(data.data.companies);
      })
  }
  useEffect(() => {
    fetchCompanies();
  }, []);
  useEffect(() => {
    if (searchTerm.length >= 3) {
      fetchCompaniesbyName(); // Realizar la llamada a la API cuando el término de búsqueda tiene al menos 3 caracteres
    }
    else {
      fetchCompanies()
    }
  }, [searchTerm]);
  async function fetchCompaniesbyName() {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
              {
                  searchCompanies(search: "${searchTerm}") {
                    id
                    typeDoc
                    doc
                    businessName
                    address
                    email
                    phone
                    logo
                    isProduction
                  }
              }
          `
      })
    })
      .then(res => res.json())
      .then(data => {
        setCompanies(data.data.searchCompanies);
      })
  }
  const handleInputSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  return (
    <>
      <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
        <div className="w-full mb-1">
          <Breadcrumb section={"Empresas"} article={"Empresa"} />

          <CompanyFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} modal={modal} />
        </div>
      </div>

      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow">
              <CompanyList companies={companies} modal={modal} setModal={setModal} company={company} setCompany={setCompany} />
            </div>
          </div>
        </div>
      </div>
      <CompanyModal modal={modal} setModal={setModal} company={company} setCompany={setCompany} initialState={initialState} fetchCompanies={fetchCompanies} />
    </>
  )
}

export default CompanyPage
