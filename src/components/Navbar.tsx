"use client";
// import Link from "next/link";
// import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { IUser } from "@/app/types";
import React, { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";
// import ImageCircle from "./images/ImageCircle";
// import UserCircle from "./icons/UserCircle";
// import { useRouter } from "next/navigation";
// import { formatDate } from "@/lib/functions";
import { useSidebar } from "@/components/context/SidebarContext";

function Navbar() {
  const { data: session, update } = useSession();
  const u = session?.user as IUser;
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  // useEffect(() => {
  //     setMounted(true)
  //   }, [])

  //   if (!mounted) {
  //     return null
  //   }

  const handleLogout = async () => {
    await signOut({ redirect: true });
  };

  return (
    // <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
    //     <div className="px-3 py-3 lg:px-5 lg:pl-3">
    //         <div className="flex items-center justify-between">
    //             <div className="flex items-center justify-start">
    //                 <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" type="button" className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
    //                     <span className="sr-only">Open sidebar</span>
    //                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    //                         <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
    //                     </svg>
    //                 </button>
    //                 <a href="/dashboard" className="flex ml-2 md:mr-24">

    //                     <Image
    //                     src="/isotipo.png"
    //                     alt="FlowBite Logo"
    //                     className="w-full h-auto mr-3"
    //                     width={89}
    //                     height={86}
    //                     sizes="20vw"
    //                     blurDataURL={'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg'}
    //                     />
    //                     <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">Portal facturador</span>
    //                 </a>
    //             </div>
    //             <div className="flex items-center">
    //                 <div className="flex items-center ml-3">

    //                     <div>
    //                         <button type="button" className="flex text-sm bg-gray-200 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" aria-expanded="false" data-dropdown-toggle="dropdown-user">
    //                             <span className="sr-only">Open user menu</span>

    //                             <Image
    //                             src="/vercel.svg"
    //                             alt="user photo"
    //                             className="w-8 h-8 rounded-full"
    //                             width={24}
    //                             height={24}
    //                             blurDataURL={'/logo.png'}
    //                             />

    //                         </button>
    //                     </div>

    //                     <div suppressHydrationWarning={true} className="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600" id="dropdown-user">
    //                         <div className="px-4 py-3" role="none">
    //                             <p className="text-sm text-gray-900 dark:text-white" role="none">{u ?u.firstName + "" + u.lastName: ""}</p>
    //                             <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-300" role="none">{u ?u.email: ""}</p>
    //                         </div>
    //                         <ul className="py-1" role="none">
    //                         {u ? (
    //                             <>
    //                                 <li><Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Perfil</Link></li>
    //                                 <li><a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer" role="menuitem" onClick={()=>signOut()}>Cerrar Sesion</a></li>
    //                             </>
    //                         ): ("")}
    //                         </ul>

    //                     </div>

    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    // </nav>

    <nav
      className={`fixed top-0 left-0 z-30 w-full h-16 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 font-encodeSansCondensed transition-all duration-300 ease-in-out ${
        isSidebarOpen ? "lg:pl-64" : ""
      }`}
    >
      {/* <div className=" bg-red-300 dark:bg-red-500 text-center p-1 text-sm">Hoy, {formatDate(new Date())}, se presenta intermitencia en los servidores de la SUNAT. La obtención del PDF y CDR podría demorar, sin embargo puede seguir facturando. Nuestro sistema los enviará automáticamente cuando sea posible.</div> */}
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <button
              type="button"
              onClick={toggleSidebar}
              id="toggleSidebarMobile"
              className="p-2 text-gray-600 rounded hover:text-gray-900 dark:text-gray-400"
            >
              {isSidebarOpen ? (
                // Ícono de "Cerrar" (X)
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              ) : (
                // Ícono de "Menú" (☰)
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              )}
            </button>

            <a href="/dashboard" className="ml-2 md:mr-24 hidden sm:flex">
              <img
                src="/images/4fact.svg"
                className="h-8 mr-3 dark:[filter:invert(100%)_sepia(100%)_brightness(100%)_contrast(300%)]"
                alt="FlowBite Logo"
              />
              <span className="self-center text-blue-900 font-sm sm:text-2xl whitespace-nowrap dark:text-white transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-800 dark:hover:text-blue-200 rounded-lg font-nulshock">
                TUFACT
              </span>
            </a>
            {/* <form action="#" method="GET" className="hidden lg:block lg:pl-3.5">
                            <label htmlFor="topbar-search" className="sr-only">Search</label>
                            <div className="relative mt-1 lg:w-96">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
                                </div>
                                <input type="text" name="email" id="topbar-search" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Search" />
                            </div>
                        </form> */}
          </div>
          <div className="flex items-center">
            {/* <div className="hidden mr-3 -mb-1 sm:block">
                            <a className="github-button" href="https://github.com/themesberg/flowbite-admin-dashboard" data-color-scheme="no-preference: dark; light: light; dark: light;" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star themesberg/flowbite-admin-dashboard on GitHub">Star</a>
                        </div> */}

            {/* <button id="toggleSidebarMobileSearch" type="button" className="p-2 text-gray-500 rounded-lg lg:hidden hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                            <span className="sr-only">Search</span>

                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
                        </button> */}

            {/* <button
                            type="button"
                            data-dropdown-toggle="notification-dropdown"
                            className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
                        >
                            <span className="sr-only">View notifications</span>

                            <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
                            </svg>
                        </button>

                        <div
                            suppressHydrationWarning
                            className="z-20 z-50 hidden max-w-sm my-4 overflow-hidden text-base list-none bg-white divide-y divide-gray-100 rounded shadow-lg dark:divide-gray-600 dark:bg-gray-700"
                            id="notification-dropdown"
                        >
                            <div className="block px-4 py-2 text-base font-medium text-center text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                Notifications
                            </div>
                            <div>
                                <a
                                    href="#"
                                    className="flex px-4 py-3 border-b hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600"
                                >
                                    <div className="flex-shrink-0">
                                        <img
                                            className="rounded-full w-11 h-11"
                                            src="/images/users/bonnie-green.png"
                                            alt="Jese image"
                                        />
                                        <div className="absolute flex items-center justify-center w-5 h-5 ml-6 -mt-5 border border-white rounded-full bg-primary-700 dark:border-gray-700">
                                            <svg
                                                className="w-3 h-3 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z"></path>
                                                <path d="M3 5a2 2 0 012-2h1a1 1 0 010 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 110-2h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="w-full pl-3">
                                        <div className="text-gray-500 font-normal text-sm mb-1.5 dark:text-gray-400">
                                            New message from{" "}
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                Bonnie Green
                                            </span>
                                            : Hey, whats up? All set for the
                                            presentation?
                                        </div>
                                        <div className="text-xs font-medium text-primary-700 dark:text-primary-400">
                                            a few moments ago
                                        </div>
                                    </div>
                                </a>
                                <a
                                    href="#"
                                    className="flex px-4 py-3 border-b hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600"
                                >
                                    <div className="flex-shrink-0">
                                        <img
                                            className="rounded-full w-11 h-11"
                                            src="/images/users/jese-leos.png"
                                            alt="Jese image"
                                        />
                                        <div className="absolute flex items-center justify-center w-5 h-5 ml-6 -mt-5 bg-gray-900 border border-white rounded-full dark:border-gray-700">
                                            <svg
                                                className="w-3 h-3 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="w-full pl-3">
                                        <div className="text-gray-500 font-normal text-sm mb-1.5 dark:text-gray-400">
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                Jese leos
                                            </span>{" "}
                                            and{" "}
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                5 others
                                            </span>{" "}
                                            started following you.
                                        </div>
                                        <div className="text-xs font-medium text-primary-700 dark:text-primary-400">
                                            10 minutes ago
                                        </div>
                                    </div>
                                </a>
                                <a
                                    href="#"
                                    className="flex px-4 py-3 border-b hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    <div className="flex-shrink-0">
                                        <img
                                            className="rounded-full w-11 h-11"
                                            src="/images/users/joseph-mcfall.png"
                                            alt="Joseph image"
                                        />
                                        <div className="absolute flex items-center justify-center w-5 h-5 ml-6 -mt-5 bg-red-600 border border-white rounded-full dark:border-gray-700">
                                            <svg
                                                className="w-3 h-3 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                                    clipRule="evenodd"
                                                ></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="w-full pl-3">
                                        <div className="text-gray-500 font-normal text-sm mb-1.5 dark:text-gray-400">
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                Joseph Mcfall
                                            </span>{" "}
                                            and{" "}
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                141 others
                                            </span>{" "}
                                            love your story. See it and view
                                            more stories.
                                        </div>
                                        <div className="text-xs font-medium text-primary-700 dark:text-primary-400">
                                            44 minutes ago
                                        </div>
                                    </div>
                                </a>
                                <a
                                    href="#"
                                    className="flex px-4 py-3 border-b hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    <div className="flex-shrink-0">
                                        <img
                                            className="rounded-full w-11 h-11"
                                            src="/images/users/leslie-livingston.png"
                                            alt="Leslie image"
                                        />
                                        <div className="absolute flex items-center justify-center w-5 h-5 ml-6 -mt-5 bg-green-400 border border-white rounded-full dark:border-gray-700">
                                            <svg
                                                className="w-3 h-3 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                                                    clipRule="evenodd"
                                                ></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="w-full pl-3">
                                        <div className="text-gray-500 font-normal text-sm mb-1.5 dark:text-gray-400">
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                Leslie Livingston
                                            </span>{" "}
                                            mentioned you in a comment:{" "}
                                            <span className="font-medium text-primary-700 dark:text-primary-500">
                                                @bonnie.green
                                            </span>{" "}
                                            what do you say?
                                        </div>
                                        <div className="text-xs font-medium text-primary-700 dark:text-primary-400">
                                            1 hour ago
                                        </div>
                                    </div>
                                </a>
                                <a
                                    href="#"
                                    className="flex px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    <div className="flex-shrink-0">
                                        <img
                                            className="rounded-full w-11 h-11"
                                            src="/images/users/robert-brown.png"
                                            alt="Robert image"
                                        />
                                        <div className="absolute flex items-center justify-center w-5 h-5 ml-6 -mt-5 bg-purple-500 border border-white rounded-full dark:border-gray-700">
                                            <svg
                                                className="w-3 h-3 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="w-full pl-3">
                                        <div className="text-gray-500 font-normal text-sm mb-1.5 dark:text-gray-400">
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                Robert Brown
                                            </span>{" "}
                                            posted a new video: Glassmorphism -
                                            learn how to implement the new
                                            design trend.
                                        </div>
                                        <div className="text-xs font-medium text-primary-700 dark:text-primary-400">
                                            3 hours ago
                                        </div>
                                    </div>
                                </a>
                            </div>
                            <a
                                href="#"
                                className="block py-2 text-base font-normal text-center text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:underline"
                            >
                                <div className="inline-flex items-center ">
                                    <svg
                                        className="w-5 h-5 mr-2"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                                        <path
                                            fillRule="evenodd"
                                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                    View all
                                </div>
                            </a>
                        </div> */}

            {/* <button
                            type="button"
                            data-dropdown-toggle="apps-dropdown"
                            className=" p-2 text-gray-500 rounded-lg sm:flex hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
                        >
                            <span className="sr-only">View notifications</span>

                            <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                            </svg>
                        </button>

                        <div
                            suppressHydrationWarning
                            className="z-20 z-50 hidden max-w-sm my-4 overflow-hidden text-base list-none bg-white divide-y divide-gray-100 rounded shadow-lg dark:bg-gray-700 dark:divide-gray-600"
                            id="apps-dropdown"
                        >
                            <div className="block px-4 py-2 text-base font-medium text-center text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                Apps
                            </div>
                            <div className="grid grid-cols-3 gap-4 p-4">
                                <a
                                    href="#"
                                    className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    <svg
                                        className="mx-auto mb-1 text-gray-500 w-7 h-7 dark:text-gray-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        Sales
                                    </div>
                                </a>
                                <a
                                    href="#"
                                    className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    <svg
                                        className="mx-auto mb-1 text-gray-500 w-7 h-7 dark:text-gray-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                                    </svg>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        Users
                                    </div>
                                </a>
                                <a
                                    href="#"
                                    className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    <svg
                                        className="mx-auto mb-1 text-gray-500 w-7 h-7 dark:text-gray-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        Inbox
                                    </div>
                                </a>
                                <a
                                    href="#"
                                    className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    <svg
                                        className="mx-auto mb-1 text-gray-500 w-7 h-7 dark:text-gray-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        Profile
                                    </div>
                                </a>
                                <a
                                    href="#"
                                    className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    <svg
                                        className="mx-auto mb-1 text-gray-500 w-7 h-7 dark:text-gray-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        Settings
                                    </div>
                                </a>
                                <a
                                    href="#"
                                    className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    <svg
                                        className="mx-auto mb-1 text-gray-500 w-7 h-7 dark:text-gray-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"></path>
                                        <path
                                            fillRule="evenodd"
                                            d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        Products
                                    </div>
                                </a>
                                <a
                                    href="#"
                                    className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    <svg
                                        className="mx-auto mb-1 text-gray-500 w-7 h-7 dark:text-gray-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        Pricing
                                    </div>
                                </a>
                                <a
                                    href="#"
                                    className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    <svg
                                        className="mx-auto mb-1 text-gray-500 w-7 h-7 dark:text-gray-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        Billing
                                    </div>
                                </a>
                                <a
                                    href="#"
                                    className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 "
                                >
                                    <svg
                                        className="mx-auto mb-1 text-gray-500 w-7 h-7 dark:text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                        ></path>
                                    </svg>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        Logout
                                    </div>
                                </a>
                            </div>
                        </div> */}

            <div className="flex items-center gap-3 px-3 py-1 mr-2 text-xs rounded-lg bg-gray-100 dark:bg-gray-700">
              <div className="flex items-center">
                <span className="mr-1 text-gray-500 dark:text-gray-400">
                  Ambiente:
                </span>
                <span
                  className={`font-medium ${
                    u?.companyIsProduction
                      ? "text-green-600 dark:text-green-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {u?.companyIsProduction ? "Producción" : "Demo"}
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center">
                <span className="mr-1 text-gray-500 dark:text-gray-400">
                  Sucursal:
                </span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {u?.subsidiaryName && u?.subsidiarySerial
                    ? `${u?.subsidiaryName} (${u?.subsidiarySerial})`
                    : "Sin asignar"}
                </span>
              </div>
            </div>

            <ThemeToggle />

            {/* <!-- Profile --> */}
            <div className="flex items-center ml-3">
              <div>
                <button
                  type="button"
                  className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                  id="user-menu-button-2"
                  aria-expanded="false"
                  data-dropdown-toggle="dropdown-2"
                >
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="w-8 h-8 rounded-full"
                    src={
                      u?.avatar != null && u?.avatar != ""
                        ? `${process.env.NEXT_PUBLIC_BASE_API}/media/users/${u?.avatar}`
                        : "/images/users/user-profile-avatar.png"
                    }
                    alt="user photo"
                  />
                  {/* {u?.avatarUrl?  
                                    <>
                                    <ImageCircle image={ u?.id&&(u?.avatarUrl as string).search("base64")==-1?`${process.env.NEXT_PUBLIC_BASE_API}/${u?.avatarUrl}`:u?.avatarUrl as string}/>                   
                                    </>                                 
                                    :
                                    <>
                                    <UserCircle/>                 
                                    </> */}
                </button>
              </div>

              <div
                suppressHydrationWarning
                className="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600"
                id="dropdown-2"
              >
                <div className="px-4 py-3" role="none">
                  <p
                    className="text-sm text-gray-900 dark:text-white"
                    role="none"
                  >
                    {u?.fullName}
                  </p>
                  <p
                    className="text-sm font-medium text-gray-900 truncate dark:text-gray-300"
                    role="none"
                  >
                    {u?.email}
                  </p>
                  <p
                    className="text-sm font-medium text-gray-900 truncate dark:text-gray-300"
                    role="none"
                  >
                    {u?.isSuperuser ? "Superusuario" : "Usuario"}
                  </p>
                </div>
                <ul className="py-1" role="none">
                  {/* <li>
                                        <a
                                            href="#"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                                            role="menuitem"
                                        >
                                            Dashboard
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                                            role="menuitem"
                                        >
                                            Settings
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="/dashboard/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                                            role="menuitem"
                                        >
                                            Earnings
                                        </a>
                                    </li> */}
                  <li>
                    <a
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                      role="menuitem"
                    >
                      Cerrar Sesión
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
