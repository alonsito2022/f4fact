import Breadcrumb from "@/components/Breadcrumb";
import React from "react";

function GuidePage() {
    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb
                        section={"Guías de Remisión"}
                        article={"Guías de Remisión"}
                    />
                </div>
            </div>
        </>
    );
}

export default GuidePage;
