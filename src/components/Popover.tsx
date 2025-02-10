import React from "react";

function Popover({ id, description }: any) {
    return (
        <div
            suppressHydrationWarning
            data-popover
            id={"popover-company-" + id}
            role="tooltip"
            className="absolute z-10 invisible inline-block text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 w-80 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-600"
        >
            <div className="p-3">
                <div className="flex">
                    <div>
                        <p
                            className="mb-4 text-sm text-center"
                            dangerouslySetInnerHTML={{ __html: description }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Popover;
