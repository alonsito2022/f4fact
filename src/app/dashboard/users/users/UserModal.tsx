import { ChangeEvent, FormEvent, MouseEvent, useEffect, useRef } from "react";

import { Modal, ModalOptions } from "flowbite";
import { toast } from "react-toastify";
import { gql, useMutation, useQuery } from "@apollo/client";

const SUBSIDIARIES_QUERY = gql`
    query {
        subsidiaries {
            id
            serial
            name
            address
            phone
            districtId
            districtName
            companyId
            companyName
        }
    }
`;
const COMPANIES_QUERY = gql`
    query Companies {
        companies {
            id
            typeDoc
            doc
            businessName
            address
            email
            phone
            shortName
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
`;
const UPDATE_USER = gql`
    mutation UpdateUser(
        $id: ID!
        $document: String!
        $firstName: String!
        $lastName: String!
        $phone: String
        $email: String!
        $password: String!
        $repeatPassword: String!
        $role: String!
        $isActive: Boolean!
        $avatar: String
        $avatarUrl: String
        $subsidiaryId: Int
    ) {
        updateUser(
            id: $id
            document: $document
            firstName: $firstName
            lastName: $lastName
            phone: $phone
            email: $email
            password: $password
            repeatPassword: $repeatPassword
            role: $role
            isActive: $isActive
            avatar: $avatar
            avatarUrl: $avatarUrl
            subsidiaryId: $subsidiaryId
        ) {
            message
        }
    }
`;

const UPDATE_USER_PASSWORD = gql`
    mutation UpdateUserPassword(
        $id: ID!
        $password: String!
        $repeatPassword: String!
    ) {
        updateUserPassword(
            id: $id
            password: $password
            repeatPassword: $repeatPassword
        ) {
            message
        }
    }
`;
const CREATE_USER = gql`
    mutation CreateUser(
        $document: String!
        $firstName: String!
        $lastName: String!
        $phone: String
        $email: String!
        $password: String!
        $repeatPassword: String!
        $role: String!
        $isActive: Boolean!
        $avatar: String
        $avatarUrl: String
        $subsidiaryId: Int
    ) {
        createUser(
            document: $document
            firstName: $firstName
            lastName: $lastName
            phone: $phone
            email: $email
            password: $password
            repeatPassword: $repeatPassword
            role: $role
            isActive: $isActive
            avatar: $avatar
            avatarUrl: $avatarUrl
            subsidiaryId: $subsidiaryId
        ) {
            message
        }
    }
`;

function UserModal({
    modal,
    setModal,
    user,
    setUser,
    initialState,
    fetchUsers,
    userLogged,
}: any) {
    const options = [
        { id: "01", value: "EMPRESARIAL" },
        { id: "02", value: "PERSONAL" },
    ];

    // Determinar permisos de edición
    const canEditAllSections = userLogged?.isSuperuser || false;
    const canEditAccountInfo = true; // Cualquier usuario logueado puede editar su información de cuenta

    // const [selectedFile, setSelectedFile] = useState<string | ArrayBuffer | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [createUser] = useMutation(CREATE_USER);
    const [updateUser] = useMutation(UPDATE_USER);
    const [updateUserPassword] = useMutation(UPDATE_USER_PASSWORD);
    const { data: companiesData } = useQuery(COMPANIES_QUERY, {
        fetchPolicy: "network-only",
    }); // Add this line

    const { data: subsidiariesData } = useQuery(SUBSIDIARIES_QUERY, {
        fetchPolicy: "network-only",
    });

    const handleFileReset = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Restablece el valor del input a una cadena vacía para deseleccionar el archivo
        }
    };
    const handleInputChange = ({
        target: { name, value },
    }: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >) => {
        if (name === "companyId") {
            // Reset subsidiaryId when company changes
            setUser({
                ...user,
                [name]: value,
                subsidiaryId: "",
            });
        } else {
            setUser({ ...user, [name]: value });
        }
    };
    const handleCheckboxChange = ({
        target: { name, checked },
    }: ChangeEvent<HTMLInputElement>) => {
        setUser({ ...user, [name]: checked });
    };
    const handleSaveUser = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validaciones que aplican a todos los usuarios
        // Nota: El email está deshabilitado, por lo que no se valida en actualizaciones
        if (Number(user.id) === 0) {
            // Solo validar email al crear un nuevo usuario
            if (!user.email?.trim()) {
                toast("El correo electrónico es requerido", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(user.email)) {
                toast("El formato del correo electrónico no es válido", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
                return;
            }
        }

        // Validaciones que solo aplican a superusuarios (cuando están editando todas las secciones)
        if (canEditAllSections) {
            if (!user.firstName?.trim()) {
                toast("El nombre es requerido", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
                return;
            }

            if (!user.document?.trim()) {
                toast("El documento es requerido", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
                return;
            }

            if (!user.role) {
                toast("El tipo de usuario es requerido", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
                return;
            }

            if (!user.subsidiaryId) {
                toast("La sede es requerida", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
                return;
            }
        }
        if (Number(user.id) !== 0) {
            try {
                let data;

                if (canEditAllSections) {
                    // Usuario superusuario: usar mutación completa
                    const updateVariables: any = {
                        id: user.id,
                        document: user.document,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        phone: user.phone,
                        email: user.email,
                        password: user.password,
                        repeatPassword: user.repeatPassword,
                        role: user.role,
                        isActive: user.isActive,
                        avatar: user.avatar,
                        avatarUrl: user.avatarUrl || "",
                        subsidiaryId: Number(user.subsidiaryId || 0),
                    };
                    console.log(
                        "Superusuario - Variables completas:",
                        updateVariables
                    );

                    data = await updateUser({
                        variables: updateVariables,
                    });
                } else {
                    // Usuario normal: usar mutación solo para contraseña
                    const passwordVariables = {
                        id: user.id,
                        password: user.password,
                        repeatPassword: user.repeatPassword,
                    };
                    console.log(
                        "Usuario normal - Solo contraseña:",
                        passwordVariables
                    );

                    data = await updateUserPassword({
                        variables: passwordVariables,
                    });
                }

                const message = canEditAllSections
                    ? (data as any)?.updateUser?.message
                    : (data as any)?.updateUserPassword?.message;

                toast(message, {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "success",
                });
                setUser(initialState);
                fetchUsers();
                modal.hide();
            } catch (error) {
                console.error(error);
                toast("Error updating user", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
            }
        } else {
            try {
                const { data } = await createUser({
                    variables: {
                        document: user.document,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        phone: user.phone,
                        email: user.email,
                        password: user.password,
                        repeatPassword: user.repeatPassword,
                        role: user.role,
                        isActive: user.isActive,
                        avatar: user.avatar,
                        avatarUrl: user.avatarUrl || "",
                        subsidiaryId: Number(user.subsidiaryId || 0),
                    },
                });

                toast(data.createUser.message, {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "success",
                });
                setUser(initialState);
                fetchUsers();
                modal.hide();
            } catch (error) {
                console.error(error);
                toast("Error creating user", {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: "error",
                });
            }
        }
    };
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
                    setUser((prevUser: any) => ({
                        ...prevUser,
                        avatarUrl: e.target?.result as string, // Asegúrate de definir el tipo correcto para e.target.result
                    }));
                }
            };

            // Lee el contenido del archivo como una URL de datos
            reader.readAsDataURL(file);
        }
    };
    useEffect(() => {
        if (modal == null) {
            const $targetEl = document.getElementById("user-modal");
            const options: ModalOptions = {
                placement: "bottom-right",
                backdrop: "static",
                backdropClasses:
                    "bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40",
                closable: false,
            };
            setModal(new Modal($targetEl, options));
        }
    }, []);

    // Add this function before the return statement
    const getFilteredSubsidiaries = () => {
        if (!user.companyId) return [];
        return (
            subsidiariesData?.subsidiaries.filter(
                (subsidiary: any) =>
                    subsidiary.companyId === Number(user.companyId)
            ) || []
        );
    };

    return (
        <div>
            <div
                id="user-modal"
                tabIndex={-1}
                aria-hidden="true"
                className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
            >
                <div className="relative p-4 w-full max-w-lg max-h-full">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {user.id ? (
                                    <p>
                                        {canEditAllSections
                                            ? "Actualizar Usuario"
                                            : "Actualizar Información de Cuenta"}
                                    </p>
                                ) : (
                                    <p>Registrar Usuario</p>
                                )}
                            </h3>
                            <button
                                type="button"
                                onClick={(e) => {
                                    modal.hide();
                                    setUser(initialState);
                                }}
                                className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                                <svg
                                    className="w-3 h-3"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 14 14"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                    />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        <div className="p-4 md:p-5">
                            <form
                                onSubmit={handleSaveUser}
                                className="space-y-6"
                            >
                                {/* Personal Information Section - Solo superusuarios */}
                                {canEditAllSections && (
                                    <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                                        <h4 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                                            Información personal
                                        </h4>
                                        <div className="grid md:grid-cols-2 md:gap-6">
                                            <div className="relative z-0 w-full mb-3 group">
                                                <label
                                                    htmlFor="firstName"
                                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                >
                                                    Nombres
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    id="firstName"
                                                    value={user.firstName}
                                                    onChange={handleInputChange}
                                                    onFocus={(e) =>
                                                        e.target.select()
                                                    }
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                                    autoComplete="off"
                                                    required
                                                />
                                            </div>
                                            <div className="relative z-0 w-full mb-3 group">
                                                <label
                                                    htmlFor="lastName"
                                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                >
                                                    Apellidos
                                                </label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    id="lastName"
                                                    value={user.lastName}
                                                    onChange={handleInputChange}
                                                    onFocus={(e) =>
                                                        e.target.select()
                                                    }
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                                    autoComplete="off"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 md:gap-6">
                                            <div className="relative z-0 w-full mb-3 group">
                                                <label
                                                    htmlFor="document"
                                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                >
                                                    Número de documento
                                                </label>
                                                <input
                                                    type="text"
                                                    name="document"
                                                    id="document"
                                                    value={user.document}
                                                    onChange={handleInputChange}
                                                    onFocus={(e) =>
                                                        e.target.select()
                                                    }
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                                    autoComplete="off"
                                                    required
                                                />
                                            </div>
                                            <div className="relative z-0 w-full mb-3 group">
                                                <label
                                                    htmlFor="phone"
                                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                >
                                                    Número de celular
                                                </label>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    id="phone"
                                                    value={
                                                        user.phone
                                                            ? user.phone
                                                            : ""
                                                    }
                                                    onChange={handleInputChange}
                                                    onFocus={(e) =>
                                                        e.target.select()
                                                    }
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Account Information Section */}
                                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                                    <h4 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                                        Información de la cuenta
                                    </h4>
                                    <div className="relative z-0 w-full mb-3 group">
                                        <label
                                            htmlFor="email"
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Correo electrónico
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            value={user.email}
                                            onChange={handleInputChange}
                                            onFocus={(e) => e.target.select()}
                                            className="bg-gray-100 border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400"
                                            autoComplete="off"
                                            required
                                            disabled
                                        />
                                    </div>
                                    <div className="grid md:grid-cols-2 md:gap-6">
                                        <div className="relative z-0 w-full mb-3 group">
                                            <label
                                                htmlFor="password"
                                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                            >
                                                Contraseña
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                id="password"
                                                value={user.password}
                                                onChange={handleInputChange}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div className="relative z-0 w-full mb-3 group">
                                            <label
                                                htmlFor="repeatPassword"
                                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                            >
                                                Confirmar Contraseña
                                            </label>
                                            <input
                                                type="password"
                                                name="repeatPassword"
                                                id="repeatPassword"
                                                value={user.repeatPassword!}
                                                onChange={handleInputChange}
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Organization Details Section - Solo superusuarios */}
                                {canEditAllSections && (
                                    <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                                        <h4 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                                            Detalles de la organización
                                        </h4>
                                        <div className="grid md:grid-cols-2 md:gap-6">
                                            <div className="relative z-0 w-full mb-3 group">
                                                <label
                                                    htmlFor="companyId"
                                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                >
                                                    Empresa
                                                </label>
                                                <select
                                                    id="companyId"
                                                    name="companyId"
                                                    onChange={handleInputChange}
                                                    value={user?.companyId}
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                                >
                                                    <option value="">
                                                        Seleccione una empresa
                                                    </option>
                                                    {companiesData?.companies.map(
                                                        (company: any) => (
                                                            <option
                                                                key={company.id}
                                                                value={
                                                                    company.id
                                                                }
                                                            >
                                                                {
                                                                    company.businessName
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>
                                            <div className="relative z-0 w-full mb-3 group">
                                                <label
                                                    htmlFor="subsidiaryId"
                                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                >
                                                    Sede/Local
                                                </label>
                                                <select
                                                    id="subsidiaryId"
                                                    name="subsidiaryId"
                                                    onChange={handleInputChange}
                                                    value={user?.subsidiaryId}
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                                    disabled={!user.companyId} // Disable if no company is selected
                                                >
                                                    <option value="">
                                                        {user.companyId
                                                            ? "Seleccione una sede"
                                                            : "Primero seleccione una empresa"}
                                                    </option>
                                                    {getFilteredSubsidiaries().map(
                                                        (subsidiary: any) => (
                                                            <option
                                                                key={
                                                                    subsidiary.id
                                                                }
                                                                value={
                                                                    subsidiary.id
                                                                }
                                                            >
                                                                {
                                                                    subsidiary.serial
                                                                }
                                                                {" - "}
                                                                {
                                                                    subsidiary.name
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 md:gap-6">
                                            <div className="relative z-0 w-full flex items-center mb-3">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="isActive"
                                                        checked={user.isActive}
                                                        onChange={
                                                            handleCheckboxChange
                                                        }
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                        {user.isActive
                                                            ? "ACTIVO"
                                                            : "INACTIVO"}
                                                    </span>
                                                </label>
                                            </div>
                                            <div className="relative z-0 w-full mb-3 group">
                                                <label
                                                    htmlFor="role"
                                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                >
                                                    Tipo de usuario
                                                </label>
                                                <select
                                                    id="role"
                                                    name="role"
                                                    onChange={handleInputChange}
                                                    value={user.role?.replace(
                                                        "A_",
                                                        ""
                                                    )}
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                                >
                                                    {options.map((o, k) => (
                                                        <option
                                                            key={k}
                                                            value={o.id}
                                                        >
                                                            {o.value}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Avatar Upload Section - Solo superusuarios */}
                                {canEditAllSections && (
                                    <div className="flex items-center justify-center w-full mb-2">
                                        <label
                                            htmlFor="avatarUrl"
                                            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                {user.avatarUrl?.length ? (
                                                    <img
                                                        src={
                                                            user.id &&
                                                            user.avatarUrl?.search(
                                                                "base64"
                                                            ) == -1
                                                                ? `${process.env.NEXT_PUBLIC_BASE_API}/${user.avatarUrl}`
                                                                : user.avatarUrl
                                                        }
                                                        alt="Imagen seleccionada"
                                                        style={{
                                                            maxWidth: "100%",
                                                            maxHeight: "200px",
                                                        }}
                                                    />
                                                ) : (
                                                    <>
                                                        <svg
                                                            className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                                                            aria-hidden="true"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 20 16"
                                                        >
                                                            <path
                                                                stroke="currentColor"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                                            />
                                                        </svg>
                                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                            <span className="font-semibold">
                                                                Haga clic para
                                                                cargar
                                                            </span>{" "}
                                                            o arrastrar y soltar
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            SVG, PNG, JPG or GIF
                                                            (MAX. 800x400px)
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                id="avatarUrl"
                                                name="avatarUrl"
                                                type="file"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onClick={handleFileReset}
                                                onChange={handleFileChange}
                                                accept="image/*"
                                            />
                                        </label>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                >
                                    {user.id
                                        ? canEditAllSections
                                            ? "Actualizar Usuario"
                                            : "Actualizar Información de Cuenta"
                                        : "Crear Usuario"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserModal;
