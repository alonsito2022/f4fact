"use client"
import { ChangeEvent, FormEvent ,useState, useEffect } from "react";
import { ICompany } from '@/app/types';
import { toast } from "react-toastify";
import { it } from "node:test";
import  CompanyList  from "./CompanyList"
import  CompanyModal  from "./CompanyModal"
import { Modal, ModalOptions } from 'flowbite'
const initialState = {
  id: 0,
  ruc: "",
  businessName: "",
  address: "",
  email: "",
  phone: "",
  document: "",
  names: "",
  isProduction: false,
  logo: ""
}
function ComapnyPage() {
  const [companies, setCompanies] = useState< ICompany[]>([]);
  const [modal, setModal] = useState< Modal | any>(null);
  const [company, setCompany] = useState(initialState);
  const [searchTerm, setSearchTerm] = useState<string>('');
  async function fetchCompanies(){
    await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
        method: 'POST',
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
            query: `
                {
                    companies {
                        id
                        typeDoc
                        doc
                        businessName
                        shortName
                        address
                        phone
                        email
                        logo
                        userSol
                        keySol
                        limit
                        emissionInvoiceWithPreviousDate
                        emissionReceiptWithPreviousDate
                        includeIgv
                        percentageIgv
                        isEnabled
                        isProduction
                        productionDate
                        disabledDate
                    }
                }
            `
        })
    })
    .then(res=>res.json())
    .then(data=>{
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
  else{
      fetchCompanies()
  }
}, [searchTerm]);
async function fetchCompaniesbyName(){
  await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
      method: 'POST',
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({
          query: `
              {
                  searchCompanies(search: "${searchTerm}") {
                    id
                    ruc
                    businessName
                    address
                    email
                    phone
                    document
                    names
                    logo
                    isProduction
                  }
              }
          `
      })
  })
  .then(res=>res.json())
  .then(data=>{
      setCompanies(data.data.searchCompanies);
  })
}
const handleInputSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setSearchTerm(event.target.value);
};
  return (
    <>
    <nav className="flex justify-between mb-3 content-center px-5 py-3 text-gray-700 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" aria-label="Breadcrumb">
  <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
    <li className="inline-flex items-center">
      <a href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
        <svg className="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
          <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
        </svg>
        Inicio
      </a>
    </li>
    <li aria-current="page">
      <div className="flex items-center">
        <svg className="rtl:rotate-180  w-3 h-3 mx-1 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
        </svg>
        <span className="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400">Empresa</span>
      </div>
    </li>
  </ol>
  <button type="button"  onClick={(e)=>{modal.show();}}  className="btn-green">Crear Empresa</button>
</nav>
<div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <div className="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
      <div>
           <h6 className="mb-0 text-2xl font-extrabold text-gray-900 dark:text-white md:text-2xl lg:text-2xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">EMPRESAS</span></h6> 
          
          </div>
          <div>
                      <label htmlFor="table-search" className="sr-only">Buscar</label>
                      <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
                          </div>
                          <input type="text" id="table-search" value={searchTerm} onChange={handleInputSearchChange} className="block px-2 py-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Buscar ruc o razon social..." />
                          
                      </div>
                    
                      {/* <ul>
                              {users.map((user) => (
                              <li key={user.id}>{user.firstName} {user.lastName}</li>
                              // Puedes mostrar más detalles del usuario si lo necesitas
                              ))}
                          </ul> */}
                  </div>
      </div>
      <CompanyList companies={companies} modal={modal}  setModal={setModal} company={company} setCompany={setCompany}/>
      </div>
      <CompanyModal modal={modal}  setModal={setModal} company={company} setCompany={setCompany} initialState={initialState} fetchCompanies={fetchCompanies}/>
    </>
  )
}

export default ComapnyPage
