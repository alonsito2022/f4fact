import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { toast } from "react-toastify";
import Save from '@/components/icons/Save';
import { Modal, ModalOptions } from 'flowbite'
import { DocumentNode, gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { IDepartment, IDistrict, IEconomicActivity, INationality, IProvince, IUser } from "@/app/types";

const SNT_PERSON_MUTATION = gql`
    mutation ($document: String!) {
        sntPerson(document: $document) {
            success
            message
            person {
                sntDocument
                sntNames
                sntAddress
                sntDepartment
                sntProvince
                sntDistrict
            }
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

function PersonForm({ modalAddPerson, setModalAddPerson, person, setPerson, jwtToken, PEOPLE_QUERY }: any) {
    const [nationalities, setNationalities] = useState<INationality[]>([]);
    const [economicActivities, setEconomicActivities] = useState<IEconomicActivity[]>([
        {"code":"0", "name": "NO APLICA"},
        {"code":"4520", "name": "MANTENIMIENTO Y REPARACIÓN DE VEHÍCULOS AUTOMOTORES"},
        {"code":"4610", "name": "VENTA AL POR MAYOR A CAMBIO DE UNA RETRIBUCIÓN O POR CONTRATA"},
        {"code":"4630", "name": "VENTA AL POR MAYOR DE ALIMENTOS, BEBIDAS Y TABACO"},
        {"code":"4690", "name": "VENTA AL POR MAYOR NO ESPECIALIZADA"},
        {"code":"4923", "name": "TRANSPORTE DE CARGA POR CARRETERA"}
    ]);
    const getAuthContext = () => ({
        headers: {
            "Content-Type": "application/json",
            "Authorization": jwtToken ? `JWT ${jwtToken}` : "",
        },
    });

    const { loading: departmentsLoading, error: departmentsError, data: departmentsData } = useQuery(DEPARTMENTS_QUERY, {
        context: getAuthContext(),
        skip: !jwtToken, // Esto evita que la consulta se ejecute si no hay token
    });

    const [provincesQuery, { loading: provincesLoading, error: provincesError, data: provincesData }] = useLazyQuery(PROVINCES_QUERY, {
        context: getAuthContext(),
    });

    const [districtsQuery, { loading: districtsLoading, error: districtsError, data: districtsData }] = useLazyQuery(DISTRICTS_QUERY, {
        context: getAuthContext(),
    });

    const [sntPersonMutation, { loading: foundSntPersonLoading, error: foundSntPersonError, data: foundSntPersonData }] = useMutation(SNT_PERSON_MUTATION, {
        context: getAuthContext(),
    });

    const handleEditProduct = async (documentNumber: string) => {

        let departmentId = "04";
        let provinceId = "0406";
        let districtId = "040601";
        let address = "";

        const { data, errors } = await sntPersonMutation({ variables: { document: documentNumber } });
        if (errors) {
            toast(errors.toString(), { hideProgressBar: true, autoClose: 2000, type: 'error' });
        }else{

            if(documentNumber.length === 11){
                departmentId = data.sntPerson.person.sntDepartment;
                provinceId = data.sntPerson.person.sntProvince;
                districtId = data.sntPerson.person.sntDistrict;
                address = data.sntPerson.person.sntAddress;
            }

            await provincesQuery({ variables: { departmentId: departmentId } });
            await districtsQuery({ variables: { provinceId: provinceId } });
            
            setPerson({ ...person, names: data.sntPerson.person.sntNames, address: address, departmentId: departmentId, provinceId: provinceId, districtId: districtId });
            toast(data.sntPerson.message, { hideProgressBar: true, autoClose: 2000, type: 'success' })
        }
      };

    const handleInputChange = async (event: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        if (name == "departmentId") {
            const { data, error } = await provincesQuery({ variables: { departmentId: value } });
            if (error) {
                toast(error?.message, { hideProgressBar: true, autoClose: 2000, type: 'error' });
            }else{
                setPerson({ ...person, departmentId: value, provinceId: "0", districtId: "0" });
            }
        }
        else if (name == "provinceId") {
            const { data, error } = await districtsQuery({ variables: { provinceId: value } });
            if (error) {
                toast(error?.message, { hideProgressBar: true, autoClose: 2000, type: 'error' });
            }else{
                setPerson({ ...person, provinceId: value, districtId: "0" });
            }
        }else if (name === "economicActivityMainReadable" && event.target instanceof HTMLInputElement) {
            const dataList = event.target.list;
            if (dataList) {
                const option = Array.from(dataList.options).find(option => option.value === value);
                if (option) {
                    const selectedId = option.getAttribute("data-key");
                    setPerson({ ...person, economicActivityMain: Number(selectedId), economicActivityMainReadable: value });
                } else {
                    setPerson({ ...person, economicActivityMain: 0, economicActivityMainReadable: "" });
                }
              } else {
                console.log('sin datalist')
            }
        }else if (name === "economicActivitySecondary1Readable" && event.target instanceof HTMLInputElement) {
            const dataList = event.target.list;
            if (dataList) {
                const option = Array.from(dataList.options).find(option => option.value === value);
                if (option) {
                    const selectedId = option.getAttribute("data-key");
                    setPerson({ ...person, economicActivitySecondary1: Number(selectedId), economicActivitySecondary1Readable: value });
                } else {
                    setPerson({ ...person, economicActivitySecondary1: 0, economicActivitySecondary1Readable: "" });
                }
              } else {
                console.log('sin datalist')
            }
        }
        else {
            setPerson({ ...person, [name]: value });
        }
    }

    const handleCheckboxChange = ({target: { name, checked} }: ChangeEvent<HTMLInputElement>) => {
        setPerson({...person, [name]: checked});
    }

    const handleSaveEmployee = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    }
    useEffect(() => {

        if (modalAddPerson == null) {

            const $targetEl = document.getElementById('modalAddPerson');
            const options: ModalOptions = {
                placement: 'top-center',
                backdrop: 'static',
                backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                closable: false,

            };
            setModalAddPerson(new Modal($targetEl, options))
        }
    }, []);

    return (
        <>
            {/* Large Modal */}
            <div id="modalAddPerson" tabIndex={-1} className="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
                <div className="relative w-full max-w-4xl max-h-full">
                    {/* Modal content */}
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                                {Number(person.id) > 0 ? "Editar" : "Registrar nuevo cliente o proveedor"}
                            </h3>
                            <button type="button"  onClick={() => { modalAddPerson.hide(); }} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/* Modal body */}
                        <div className="p-4 md:p-5 space-y-4">
                            
                            



                        <form onSubmit={handleSaveEmployee}>

<div className="grid gap-4 mb-4 sm:grid-cols-4 items-end">

    {/* <div className="sm:col-span-1">
        <label htmlFor="code" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Codigo</label>
        <input type="number" id="code"
            name="code" value={person.code} onChange={handleInputChange} autoComplete="off"
            className="shadow-sm form-control-sm dark:shadow-sm-light"
            placeholder=""
            maxLength={20}
            required />
    </div> */}


    <div className="sm:col-span-1">
        <label htmlFor="documentType" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipo Documento</label>
        <select id="documentType"
            name="documentType" value={person.documentType.replace("A_", "")} onChange={handleInputChange}
            className="form-control-sm">
            <option value={"01"}>DNI</option>
            <option value={"06"}>RUC</option>
        </select>
    </div>

{/* 
    <div className="sm:col-span-2">
        <label htmlFor="documentNumber" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Numero documento</label>
        <input type="text" id="documentNumber"
            name="documentNumber" value={person.documentNumber || ""} onChange={handleInputChange} autoComplete="off"
            maxLength={25}
            className="shadow-sm form-control-sm dark:shadow-sm-light"
            placeholder="45453473" />
    </div> */}

    <div className="relative sm:col-span-3">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
        </div>
        <input type="text" name="documentNumber" maxLength={12}  inputMode="numeric"  autoComplete="off"
        value={person.documentNumber || ""} onChange={handleInputChange}
        className="block w-full py-1.5 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Ingrese numero de documento" required />
        <button type="button" 
        onClick={() => handleEditProduct(person.documentNumber)}
        className=" absolute end-1 bottom-1 px-3.5 py-1 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-xs dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">EXTRAER</button>
    </div>

    <div className="sm:col-span-3">
        <label htmlFor="names" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombres o Razon Social</label>
        <input type="text" id="names"
            name="names" value={person.names} onChange={handleInputChange} autoComplete="off"
            className="shadow-sm form-control-sm dark:shadow-sm-light"
            placeholder="" />
    </div>



    <div className="sm:col-span-1">
        <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Celular</label>
        <input type="text" id="phone"
            name="phone" value={person.phone||""} onChange={handleInputChange} autoComplete="off"
            className="shadow-sm form-control-sm dark:shadow-sm-light"
            placeholder="921267878" />
    </div>
    
    <div className="sm:col-span-1">
        {departmentsLoading ? <div>Cargando...</div> : 
        departmentsError ? <div>Error: No autorizado o error en la consulta. {departmentsError.message}</div> : 
        departmentsData ? 
        <>
            <label htmlFor="departmentId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Departamento</label>
            <select id="departmentId"
                name="departmentId" value={person?.departmentId} onChange={handleInputChange} required
                className="form-control-sm">
                <option value={"0"}>ELEGIR</option>
                {departmentsData?.departments?.map((d: IDepartment, k: number) => (
                    <option key={k} value={d.id}>{d.description.replace("DEPARTAMENTO ", "")}</option>
                ))}
            </select>
        </>:<input type="text" className="shadow-sm form-control-sm dark:shadow-sm-light" disabled value={"No hay datos..."}/>}
    </div>
    
    <div className="sm:col-span-1">
        {provincesLoading ? <div>Cargando...</div> : 
        provincesError ? <div>Error: No autorizado o error en la consulta. {provincesError.message}</div> : 
        provincesData ?
        <>
            <label htmlFor="provinceId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Provincia</label>
            <select id="provinceId"
                name="provinceId" value={person?.provinceId} onChange={handleInputChange} required
                className="form-control-sm">
                <option value={"0"}>ELEGIR</option>
                {provincesData?.provincesByDepartmentId?.map((d: IProvince, k: number) => (
                    <option key={k} value={d.id}>{d.description}</option>
                ))}
            </select>
        </>:<input type="text" className="shadow-sm form-control-sm dark:shadow-sm-light" disabled value={"No hay datos..."}/>}
        
    </div>
    
    <div className="sm:col-span-2">
        {districtsLoading ? <div>Cargando...</div> : 
        districtsError ? <div>Error: No autorizado o error en la consulta. {districtsError.message}</div> : 
        districtsData ?
        <>
        <label htmlFor="districtId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Distrito</label>
        <select id="districtId"
            name="districtId" value={person?.districtId} onChange={handleInputChange} required
            className="form-control-sm">
            <option value={"0"}>ELEGIR</option>
            {districtsData?.districtsByProvinceId?.map((d: IDistrict, k: number) => (
                <option key={k} value={d.id}>{d.description}</option>
            ))}
        </select>
        </>:<input type="text" className="shadow-sm form-control-sm dark:shadow-sm-light" disabled value={"No hay datos..."}/>}
    </div>


    <div className="sm:col-span-4">
        <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Dirección</label>
        <input type="text" id="address"
            name="address" value={person.address || ""} onChange={handleInputChange} autoComplete="off"
            className="shadow-sm form-control-sm dark:shadow-sm-light"
            placeholder="Av. Aviacion S/N" />
    </div>

    <div className="sm:col-span-2">
        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
        <input type="email" id="email"
            name="email" value={person.email || ""} onChange={handleInputChange} autoComplete="off"
            className="shadow-sm form-control-sm dark:shadow-sm-light"
            placeholder="uncorreo@gmail.com" />
    </div>


    <div className="sm:col-span-2">
        <label htmlFor="nationality" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nacionalidad</label>
        <input type="search" id="nationality"
            name="nationality" value={person.nationality || ""} onChange={handleInputChange} autoComplete="off" list="nationalityList"
            className="shadow-sm form-control-sm dark:shadow-sm-light"
            placeholder="Nacionalidad" />
        <datalist id="nationalityList">
            {nationalities?.map((n: INationality, index: number) => (
                <option key={index} value={n.name} />
            ))}
        </datalist>
    </div>

    <div className="sm:col-span-2">
        <label htmlFor="economicActivityMainReadable" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Actividad Económica (Principal):</label>
        <input type="search" id="economicActivityMainReadable"
            name="economicActivityMainReadable" value={person.economicActivityMainReadable || ""} onChange={handleInputChange} autoComplete="off" list="economicActivityMainReadableList"
            className="shadow-sm form-control-sm dark:shadow-sm-light"
            placeholder="Actividad(es) Económica(s)" />
        <datalist id="economicActivityMainReadableList">
            {economicActivities?.map((n: IEconomicActivity, index: number) => (
                <option key={index} value={n.name} data-key={n.code} />
            ))}
        </datalist>
    </div>

    <div className="sm:col-span-2">
        <label htmlFor="economicActivitySecondary1Readable" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Actividad Económica (Secundaria 1):</label>
        <input type="search" id="economicActivitySecondary1Readable"
            name="economicActivitySecondary1Readable" value={person.economicActivitySecondary1Readable || ""} onChange={handleInputChange} autoComplete="off" list="economicActivitySecondary1ReadableList"
            className="shadow-sm form-control-sm dark:shadow-sm-light"
            placeholder="Actividad(es) Económica(s)" />
        <datalist id="economicActivitySecondary1ReadableList">
            {economicActivities?.map((n: IEconomicActivity, index: number) => (
                <option key={index} value={n.name} data-key={n.code} />
            ))}
        </datalist>
    </div>



    <div className="sm:col-span-4">
        <div className="flex items-center">
            <input id="isEnabled"  name="isEnabled" checked={person.isEnabled} type="checkbox" onChange={handleCheckboxChange} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
            <label htmlFor="isEnabled" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Activo</label>
        </div>
    </div>

    <div className="sm:col-span-4 text-right">
        <hr className="mb-4" />
        <button id="btn-save" type="submit" className="btn-green py-1.5 px-2.5 inline-flex items-center">
            <svg className="w-6 h-6 me-2 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7.414A2 2 0 0 0 20.414 6L18 3.586A2 2 0 0 0 16.586 3H5Zm3 11a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6H8v-6Zm1-7V5h6v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1Z" clipRule="evenodd"/>
            <path fillRule="evenodd" d="M14 17h-4v-2h4v2Z" clipRule="evenodd"/>
            </svg>
            GUARDAR
        </button>
    </div>

</div>

</form>







                        </div>
                        {/* Modal footer */}
                        <div className="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b dark:border-gray-600">
                            <button type="button" onClick={() => { modalAddPerson.hide(); }} className="btn-dark px-5 py-2 inline-flex items-center gap-2">Cerrar</button>
                            <button type="button" onClick={() => { modalAddPerson.hide(); }} className="btn-green px-5 py-2 inline-flex items-center gap-2"> <Save /> Crear Cliente o Proveedor</button>
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}

export default PersonForm
