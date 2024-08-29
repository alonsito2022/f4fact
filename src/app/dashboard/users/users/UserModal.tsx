
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
                    updateUser(
                        id:${user.id}, document: "${user.document}", firstName: "${user.firstName}",lastName: "${user.lastName}",phone: "${user.phone}", email: "${user.email}", password: "${user.password}", repeatPassword: "${user.repeatPassword}", role: "${user.role}", isActive: ${user.isActive}, avatar:"${user.avatar}"
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
                        document: "${user.document}", firstName: "${user.firstName}",lastName: "${user.lastName}",phone: "${user.phone}", email: "${user.email}", password: "${user.password}", repeatPassword: "${user.repeatPassword}", role: "${user.role}", isActive: ${user.isActive}, avatar:"${user.avatar}"
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
                avatar: e.target?.result as string // Asegúrate de definir el tipo correcto para e.target.result
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
                    <div className="relative z-0 w-full mb-6 group">
                        <input type="text" name="firstName" id="firstName" value={user.firstName} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                        <label htmlFor="firstName" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Nombres</label>
                    </div>
                    <div className="relative z-0 w-full mb-6 group">
                        <input type="text" name="lastName" id="lastName" value={user.lastName} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                        <label htmlFor="lastName" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Apellidos</label>
                    </div>
                </div>                
                <div className="grid md:grid-cols-2 md:gap-6">
                    <div className="relative z-0 w-full mb-6 group">
                        <input type="text" name="document" id="document" value={user.document} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                        <label htmlFor="document" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Nº Documento</label>
                    </div>
                    <div className="relative z-0 w-full mb-6 group">
                    <input type="text" name="phone" id="phone" value={user.phone?user.phone:''} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" "/>
                    <label htmlFor="phone" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Telefono/Celular</label>
                </div>
                </div>  
                <div className="relative z-0 w-full mb-6 group">
                    <input type="email" name="email" id="email" value={user.email} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                    <label htmlFor="email" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Email address</label>
                </div>              
                <div className="grid md:grid-cols-2 md:gap-6">
                <div className="relative z-0 w-full mb-6 group">
                    <input type="password" name="password" id="password" value={user.password} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                    <label htmlFor="password" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Contraseña</label>
                </div>
                    <div className="relative z-0 w-full mb-6 group">
                    <input type="password" name="repeatPassword" id="repeatPassword" value={user.repeatPassword!} onChange={handleInputChange} onFocus={(e) => e.target.select()} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                    <label htmlFor="repeatPassword" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Confirmar Contraseña</label>
                </div>
                </div>                
                <div className="grid md:grid-cols-2 md:gap-6">
                    <div className="relative z-0 w-full flex items-center mb-6">
                        <input id="isActive" name="isActive" type="checkbox" checked={user.isActive} onChange={handleCheckboxChange} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                        <label htmlFor="isActive" className="ms-2 text-sm font-medium text-gray-400 dark:text-gray-500">Estado</label>
                    </div>
                    <div className="relative z-0 w-full mb-6 group">
                        <label htmlFor="role" className="sr-only">Rol Usuario</label>
                        <select id="role" name="role" onChange={handleInputChange} value={user.role?.replace("A_", "")} className="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer">
                        {options.map((o,k)=>(
                                <option key={k} value={o.id}>{o.value}</option>
                            ))}
                        </select>
                     </div>
                </div>
                <div className="flex items-center justify-center w-full mb-2">
                    <label htmlFor="avatar" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {user.avatar?.length? 
                                <img
                                src={ user.id&&user.avatar?.search("base64")==-1?`${process.env.NEXT_PUBLIC_BASE_API}/${user.avatar}`:user.avatar}
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
                        <input id="avatar" name="avatar" type="file" className="hidden" ref={fileInputRef} onClick={handleFileReset} onChange={handleFileChange} accept="image/*"/>
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
