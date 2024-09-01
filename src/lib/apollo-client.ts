// for server components
import { ApolloClient, InMemoryCache } from "@apollo/client";
const createApolloClient = () => {
  return new ApolloClient({
    uri: `${process.env.NEXT_PUBLIC_BASE_API}/graphql`,
    cache: new InMemoryCache(),
  });
};

export default createApolloClient;