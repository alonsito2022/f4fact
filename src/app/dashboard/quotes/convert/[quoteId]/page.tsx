import React from "react";
const limaDate = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Lima" })
);
function ConvertToInvoicePage() {
    return (
        <div>
            <h1>Convert to Invoice Page</h1>
        </div>
    );
}

export default ConvertToInvoicePage;
