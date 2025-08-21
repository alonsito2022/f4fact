import { gql, useQuery } from "@apollo/client";
import React from "react";
import { useAuth } from "./providers/AuthProvider";
const GET_ACTIVE_ANNOUNCEMENTS = gql`
    query GetActiveAnnouncements {
        activeAnnouncements {
            id
            message
            messageType
            startDate
            endDate
        }
    }
`;
function HeaderAnnouncement() {
    const auth = useAuth();
    const { data, loading, error } = useQuery(GET_ACTIVE_ANNOUNCEMENTS, {
        context: {
            headers: {
                "Content-Type": "application/json",
                Authorization: auth?.jwtToken ? `JWT ${auth.jwtToken}` : "",
            },
        },
        skip: !auth?.jwtToken,
        pollInterval: 60000, // Actualiza cada 60 segundos
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            console.log("data", data);
        },
    });

    if (loading) return <div>Cargando mensajes...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="space-y-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            {data?.activeAnnouncements?.map((msg: any) => (
                <div
                    key={msg.id}
                    className={`p-3 rounded ${
                        msg.messageType === "URGENT"
                            ? "bg-red-100 text-red-800"
                            : msg.messageType === "WARNING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                    }`}
                >
                    {msg.message}
                </div>
            ))}
        </div>
    );
}

export default HeaderAnnouncement;
