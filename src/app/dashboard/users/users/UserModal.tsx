
import { ChangeEvent, FormEvent ,MouseEvent, useEffect, useRef } from "react";

import { Modal, ModalOptions } from 'flowbite'
import { toast } from "react-toastify";

function UserModal({modal, setModal, user, setUser, initialState, fetchUsers}:any) {
    const options = [
        {id: '01', value: 'EMPRESARIAL'}, 
        {id: '02', value: 'PERSONAL'}
    ];
    // const [selectedFile, setSelectedFile] = useState<string | ArrayBuffer | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleFileReset = () => {
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Restablece el valor del input a una cadena vacía para deseleccionar el archivo
        }
    };
    const handleInputChange = ({target: {name, value} }: ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
        setUser({...user, [name]: value});
    }
    const handleCheckboxChange = ({target: { name, checked} }: ChangeEvent<HTMLInputElement>) => {
        setUser({...user, [name]: checked});
    }
    const handleSaveUser = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let queryFetch: String = "";
        if(Number(user.id)!==0){
            queryFetch = `
                mutation{
                    updateUser(id:${user.id}, document: "${user.document}", firstName: "${user.firstName}",lastName: "${user.lastName}",phone: "${user.phone}", email: "${user.email}", password: "${user.password}", repeatPassword: "${user.repeatPassword}", role: "${user.role}", isActive: ${user.isActive}, avatar:"${user.avatar}", avatarUrl:"${user.avatarUrl === undefined?"":user.avatarUrl}")
                    {
                        message
                    }
                }
            `;
            console.log(queryFetch)
            await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
                method: 'POST',
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({query: queryFetch})
            })
            .then(res=>res.json())
            .then(data=>{
                toast(data.data.updateUser.message, { hideProgressBar: true, autoClose: 2000, type: 'success' })
                setUser(initialState);
                fetchUsers();
                modal.hide();

            }).catch(e=>console.log(e))
        }
        else{
            queryFetch = `
                mutation{
                    createUser(
                        document: "${user.document}", firstName: "${user.firstName}",lastName: "${user.lastName}",phone: "${user.phone}", email: "${user.email}", password: "${user.password}", repeatPassword: "${user.repeatPassword}", role: "${user.role}", isActive: ${user.isActive}, avatar:"${user.avatar}", avatarUrl:"${user.avatarUrl === undefined?"":user.avatarUrl}"
                    ){
                        message
                    }
                }
            `;
            // console.log(queryFetch)
            await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
                method: 'POST',
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({query: queryFetch})
            })
            .then(res=>res.json())
            .then(data=>{
                toast(data.data.createUser.message, { hideProgressBar: true, autoClose: 2000, type: 'success' })
                setUser(initialState);
                fetchUsers();
                modal.hide();
            }).catch(e=>console.log(e))
        }


    }
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; // Obtiene el primer archivo seleccionado
    
        // Verifica si se seleccionó un archivo
        if (file) {
          const reader = new FileReader();
    
          // Cuando se carga el archivo, muestra la imagen en el componente
          reader.onload = (e: ProgressEvent<FileReader>) => {
            if (e.target?.result) {
                // console.log(e.target?.result)
            //   setUser({...user, avatar:e.target.result});
            setUser((prevUser:any) => ({
                ...prevUser,
                avatarUrl: e.target?.result as string // Asegúrate de definir el tipo correcto para e.target.result
              }));
            }
          };
    
          // Lee el contenido del archivo como una URL de datos
          reader.readAsDataURL(file);
        }
      };
    useEffect(() => {        
        if(modal == null){
            const $targetEl = document.getElementById('user-modal');
            const options: ModalOptions = {
                placement: 'bottom-right',
                backdrop: 'static',
                backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                closable: false 
            };
            setModal(new Modal($targetEl, options))
        }
      }, []);

    //   useEffect(() => {  
    //         console.log(user)

    //   }, [user]);
  return (
    <div>    
<div id="user-modal" tabIndex={-1} aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
    <div className="relative p-4 w-full max-w-lg max-h-full">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user.id ? <p>Actualizar Usuario</p> : <p>Registrar Usuario</p>}
                </h3>
                <button type="button" onClick={(e)=>{modal.hide();setUser(initialState);}} className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                    <span className="sr-only">Close modal</span>
                </button>
            </div>
            <div className="p-4 md:p-5">
                <form onSubmit={handleSaveUser}>               
                <div className="grid md:grid-cols-2 md:gap-6">
                    <div className="relative z-0 w-full mb-3 group">
                        <label htmlFor="firstName" className="form-label-sm">Nombres</label>
                        <input type="text" name="firstName" id="firstName" value={user.firstName} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="form-control-sm" autoComplete="off" required />
                    </div>
                    <div className="relative z-0 w-full mb-3 group">
                        <label htmlFor="lastName" className="form-label-sm">Apellidos</label>
                        <input type="text" name="lastName" id="lastName" value={user.lastName} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="form-control-sm" autoComplete="off" required />
                    </div>
                </div>                
                <div className="grid md:grid-cols-2 md:gap-6">
                    <div className="relative z-0 w-full mb-3 group">
                        <label htmlFor="document" className="form-label-sm">Nº Documento</label>
                        <input type="text" name="document" id="document" value={user.document} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="form-control-sm" autoComplete="off" required />
                    </div>
                    <div className="relative z-0 w-full mb-3 group">
                    <label htmlFor="phone" className="form-label-sm">Telefono/Celular</label>
                    <input type="text" name="phone" id="phone" value={user.phone?user.phone:''} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="form-control-sm" autoComplete="off"/>
                </div>
                </div>  
                <div className="relative z-0 w-full mb-3 group">
                    <label htmlFor="email" className="form-label-sm">Email address</label>
                    <input type="email" name="email" id="email" value={user.email} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="form-control-sm" autoComplete="off" required />
                </div>              
                <div className="grid md:grid-cols-2 md:gap-6">
                <div className="relative z-0 w-full mb-3 group">
                    <label htmlFor="password" className="form-label-sm">Contraseña</label>
                    <input type="password" name="password" id="password" value={user.password} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="form-control-sm" autoComplete="off" />
                </div>
                    <div className="relative z-0 w-full mb-3 group">
                    <label htmlFor="repeatPassword" className="form-label-sm">Confirmar Contraseña</label>
                    <input type="password" name="repeatPassword" id="repeatPassword" value={user.repeatPassword!} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="form-control-sm" autoComplete="off" />
                </div>
                </div>    
                <div className="grid md:grid-cols-2 md:gap-6">
                    <div className="relative z-0 w-full mb-3 group">
                        <label htmlFor="role" className="form-label-sm">Empresa</label>
                        <select id="role" name="role" onChange={handleInputChange} value={user.companyId?.replace("A_", "")} className="form-control-sm">
                        {options.map((o,k)=>(
                                <option key={k} value={o.id}>{o.value}</option>
                            ))}
                        </select>
                     </div>
                    <div className="relative z-0 w-full mb-3 group">
                        <label htmlFor="role" className="form-label-sm">Sede/Local</label>
                        <select id="role" name="role" onChange={handleInputChange} value={user.subsidiaryId?.replace("A_", "")} className="form-control-sm">
                        {options.map((o,k)=>(
                                <option key={k} value={o.id}>{o.value}</option>
                            ))}
                        </select>
                     </div>
                </div>               
                <div className="grid md:grid-cols-2 md:gap-6">
                    <div className="relative z-0 w-full flex items-center mb-3">
                        <input id="isActive" name="isActive" type="checkbox" checked={user.isActive} onChange={handleCheckboxChange} className="form-check-input"/>
                        <label htmlFor="isActive" className="form-check-label">Estado</label>
                    </div>
                    <div className="relative z-0 w-full mb-3 group">
                        <label htmlFor="role" className="form-label-sm">Rol Usuario</label>
                        <select id="role" name="role" onChange={handleInputChange} value={user.role?.replace("A_", "")} className="form-control-sm">
                        {options.map((o,k)=>(
                                <option key={k} value={o.id}>{o.value}</option>
                            ))}
                        </select>
                     </div>
                </div>
                <div className="flex items-center justify-center w-full mb-2">
                    <label htmlFor="avatarUrl" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {user.avatarUrl?.length? 
                                <img
                                src={ user.id&&user.avatarUrl?.search("base64")==-1?`${process.env.NEXT_PUBLIC_BASE_API}/${user.avatarUrl}`:user.avatarUrl}
                                alt="Imagen seleccionada"
                                style={{ maxWidth: '100%', maxHeight: '200px' }}
                            />:
                            <>
                                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                </svg>
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Haga clic para cargar</span> o arrastrar y soltar</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                            </> }  
                        </div>
                        <input id="avatarUrl" name="avatarUrl" type="file" className="hidden" ref={fileInputRef} onClick={handleFileReset} onChange={handleFileChange} accept="image/*"/>
                    </label>
                </div> 
                <button type="submit" className="btn-blue">{user.id ? <p>Actualizar Usuario</p> : <p>Crear Usuario</p>}</button>
                </form>
            </div>
        </div>
    </div>
</div> 

    </div>
  )
}

export default UserModal
