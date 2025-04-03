import React from "react";

function Breadcrumb({ section, article }: any) {
    return (
        <div className="mb-4">
            <nav className="flex mb-5" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 text-sm font-medium md:space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
                    <li className="inline-flex items-center">
                        <a
                            href="/dashboard"
                            className="inline-flex items-center text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
                        >
                            <svg
                                className="w-5 h-5 mr-2.5 transition-transform duration-200 transform hover:scale-110"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                            </svg>
                            <span className="hover:underline">Inicio</span>
                        </a>
                    </li>
                    <li>
                        <div className="flex items-center">
                            <svg
                                className="w-6 h-6 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                            <a
                                href="#"
                                className="ml-1 text-gray-700 hover:text-blue-600 md:ml-2 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200 hover:underline"
                            >
                                {section}
                            </a>
                        </div>
                    </li>
                    <li>
                        <div className="flex items-center">
                            <svg
                                className="w-6 h-6 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                            <span
                                className="ml-1 text-blue-600 font-semibold md:ml-2 dark:text-blue-400"
                                aria-current="page"
                            >
                                {article}
                            </span>
                        </div>
                    </li>
                </ol>
            </nav>
            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white pl-4">
                {article}
                <div className="h-1 w-20 bg-blue-600 rounded-full mt-2"></div>
            </h1>
        </div>
    );
}

export default Breadcrumb;
