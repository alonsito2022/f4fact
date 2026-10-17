// for client components
"use client";
import React, { ReactNode, useState } from "react";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

/**
 * Cliente unico a nivel de modulo.
 * Si se creara dentro del componente, cada re-render (foco de ventana,
 * refetch de sesion, cambio de tema) generaria un InMemoryCache nuevo,
 * descartando toda la cache y obligando a re-consultar todo.
 */
let singleton: ApolloClient<unknown> | null = null;

function createApolloClient() {
    return new ApolloClient({
        uri: `${process.env.NEXT_PUBLIC_BASE_API}/graphql`,
        // Sin typePolicies para allSales: el comportamiento por defecto indexa
        // el campo por TODAS sus argumentos (incluidos page y pageSize) y no
        // fusiona resultados, que es lo correcto para una lista paginada.
        //
        // Antes se excluian page/pageSize del keyArgs y se fusionaba a mano con
        // un Map por id. El problema es que merge() recibe los datos ya
        // normalizados: cada fila llega como { __ref: "Operation:3613661" }, sin
        // la propiedad id. El Map usaba undefined como clave, las 25 filas
        // colapsaban a una sola entrada y cada pagina siguiente terminaba
        // pintando un unico comprobante.
        //
        // Los objetos anidados (client, subsidiary) si se normalizan solos, sin
        // duplicarse por fila, en cuanto la query pide su id.
        cache: new InMemoryCache(),
        defaultOptions: {
            watchQuery: {
                // Muestra cache al instante y refresca en segundo plano.
                fetchPolicy: "cache-and-network",
                nextFetchPolicy: "cache-first",
            },
            query: { fetchPolicy: "network-only" },
        },
        connectToDevTools: process.env.NODE_ENV === "development",
    });
}

export function getApolloClient() {
    if (!singleton) singleton = createApolloClient();
    return singleton;
}

export const ApolloWrapper = ({ children }: { children: ReactNode }) => {
    const [client] = useState(getApolloClient);
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};