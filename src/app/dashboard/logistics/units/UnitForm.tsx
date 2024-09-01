import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { toast } from "react-toastify";
import Save from '@/components/icons/Save';
import { Modal, ModalOptions } from 'flowbite'
import { DocumentNode, gql, useMutation } from "@apollo/client";

const ADD_UNIT = gql`
    mutation($shortName:String!, $description:String!, $code:String!){
        createUnit(
            shortName: $shortName, description: $description, code: $code
        ){
            message
        }
    }
`;

const UPDATE_UNIT = gql`
    mutation($unitId:ID!, $shortName:String!, $description:String!, $code:String!){
        updateUnit(
            id:$unitId, shortName: $shortName, description: $description, code: $code
        ){
            message
        }
    }
`;

function UnitForm({ modal, setModal, unit, setUnit, initialState, jwtToken, UNITS_QUERY }: any) {

    function useCustomMutation(mutation: DocumentNode, refetchQuery: DocumentNode) {
        const getAuthContext = () => ({
            headers: {
                "Content-Type": "application/json",
                "Authorization": jwtToken ? `JWT ${jwtToken}` : "",
            },
        });

        return useMutation(mutation, {
            context: getAuthContext(),
            refetchQueries: () => [{ query: refetchQuery, context: getAuthContext() }],
            onError: (err) => console.error("Error in unit:", err), // Log the error for debugging
        });
    }

    const [createUnit] = useCustomMutation(ADD_UNIT, UNITS_QUERY);
    const [updateUnit] = useCustomMutation(UPDATE_UNIT, UNITS_QUERY);

    useEffect(() => {

        if (modal == null) {

            const $targetEl = document.getElementById('defaultModal');
            const options: ModalOptions = {
                placement: 'bottom-right',
                backdrop: 'static',
                backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                closable: false,

            };
            setModal(new Modal($targetEl, options))
        }
    }, []);

    const handleInputChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setUnit({ ...unit, [name]: value });
    }

    const handleSaveSubLine = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (Number(unit.id) !== 0) {
            const { data, errors } = await updateUnit({
                variables: { unitId: unit.id, shortName: unit.shortName, description: unit.description, code: unit.code }
            })
            if (errors) {
                toast(errors.toString(), { hideProgressBar: true, autoClose: 2000, type: 'error' });
            }else{
                toast(data.updateUnit.message, { hideProgressBar: true, autoClose: 2000, type: 'success' })
                setUnit(initialState);
                modal.hide();
            }

        } else {
            const { data, errors } = await createUnit({
                variables: { shortName: unit.shortName, description: unit.description, code: unit.code }
            })
            if (errors) {
                toast(errors.toString(), { hideProgressBar: true, autoClose: 2000, type: 'error' });
            }else{
                toast(data.createUnit.message, { hideProgressBar: true, autoClose: 2000, type: 'success' })
                setUnit(initialState);
                modal.hide();
            }
        }
    }

    return (
        <div id="defaultModal" tabIndex={-1} aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full">
            <div className="relative w-full max-w-md max-h-full">

                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">

                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                            {Number(unit.id) > 0 ? "Editar" : "Registrar nueva unidad"}
                        </h3>
                        <button type="button" onClick={() => { modal.hide(); }}
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                            <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    <form onSubmit={handleSaveSubLine}>
                        <div className="p-4 md:p-5 space-y-4">

                            <input type="hidden" name="id" id="id" value={unit.id} />
                            <div className="grid">

                                <div className="sm:col-span-2 mb-4">
                                    <label htmlFor="shortName" className="form-label-sm">Nombre Corto</label>
                                    <input type="text" name="shortName" id="shortName" maxLength={5} value={unit.shortName || ""} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="form-control-sm" required autoComplete="off" />
                                </div>

                                <div className="sm:col-span-2 mb-4">
                                    <label htmlFor="description" className="form-label-sm">Descripcion</label>
                                    <input type="text" name="description" id="description" maxLength={100} value={unit.description || ""} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="form-control-sm" required autoComplete="off" />
                                </div>

                                <div className="sm:col-span-2 mb-4">
                                    <label htmlFor="code" className="form-label-sm">Codigo Sunat</label>
                                    <input type="text" name="code" id="code" maxLength={20} value={unit.code || ""} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="form-control-sm" required autoComplete="off" />
                                </div>

                            </div>

                        </div>

                        <div className="flex p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600  justify-end">
                            <button id="btn-save" type="submit" className="btn-green px-5 py-2 inline-flex items-center gap-2">
                                <Save />{Number(unit.id) > 0 ? "Actualizar" : "Guardar"}
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    )
}

export default UnitForm
