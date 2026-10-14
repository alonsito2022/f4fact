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
        cache: new InMemoryCache({
            typePolicies: {
                Query: {
                    fields: {
                        // La lista de ventas se cachea por filtros (no por pagina),
                        // de modo que `client` y `subsidiary` embebidos se
                        // normalizan y no se duplican en cada fila.
                        allSales: {
                            keyArgs: [
                                "subsidiaryId",
                                "clientId",
                                "startDate",
                                "endDate",
                                "documentType",
                                "userId",
                                "onlyDraft",
                            ],
                            merge(existing, incoming, { args }) {
                                if (!args?.page || args.page === 1) return incoming;
                                const merged = existing?.sales?.slice() ?? [];
                                const byId = new Map(merged.map((d: any) => [d.id, d]));
                                (incoming?.sales ?? []).forEach((d: any) => byId.set(d.id, d));
                                return { ...incoming, sales: Array.from(byId.values()) };
                            },
                        },
                    },
                },
            },
        }),
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