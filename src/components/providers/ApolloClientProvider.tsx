// "use client";
// import React, { ReactNode } from "react";
// import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

// export const ApolloClientProvider = ({ children }: { children: ReactNode }) => {
//   const client = new ApolloClient({
//     uri: `${process.env.NEXT_PUBLIC_BASE_API}/graphql`,
//     cache: new InMemoryCache(),
//   });
//   return <ApolloProvider client={client}>{children}</ApolloProvider>;
// };