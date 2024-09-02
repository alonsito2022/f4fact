"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Breadcrumb from "@/components/Breadcrumb";

function SalePage() {
    return (
        <>
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <Breadcrumb section={"Ventas"} article={"Ventas"} />
                    
                </div>
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                            
                            
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SalePage
