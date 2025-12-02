import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import createUploadLink from "apollo-upload-client/public/createUploadLink.js";
import { useMemo } from "react";

let apolloClient: ApolloClient<any> | null = null;

export function getApolloClient() {
  // Error logging link
  const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ),
      );
    }
    if (networkError) {
      console.error(`[Network error]: ${networkError}`, operation);
    }
  });

  // Auth link - dynamically read JWT token on EVERY request
  const authLink = setContext((_, { headers }) => {
    // Get the JWT token from localStorage on each request
    const jwtToken =
      typeof window !== "undefined"
        ? window.localStorage.getItem("jwtToken")
        : null;

    console.log("Apollo Request - JWT Token:", jwtToken ? `Bearer ${jwtToken.substring(0, 20)}...` : "No token found");

    return {
      headers: {
        ...headers,
        // IMPORTANT: Backend expects "Bearer {token}" format
        Authorization: jwtToken ? `Bearer ${jwtToken}` : "",
      },
    };
  });

  // Upload link
  const uploadLink = createUploadLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    credentials: "include",
  });

  console.log("Apollo Client GraphQL URL:", process.env.NEXT_PUBLIC_GRAPHQL_URL);

  const client = new ApolloClient({
    ssrMode: typeof window === "undefined",
    // IMPORTANT: authLink must come BEFORE uploadLink to add headers
    link: ApolloLink.from([errorLink, authLink, uploadLink as any]),
    cache: new InMemoryCache({
      dataIdFromObject: (object) => `${object.__typename}${object.id}`,
    }),
  });

  // For SSR, always create a new client
  if (typeof window === "undefined") return client;

  // For client-side, reuse existing client
  if (!apolloClient) apolloClient = client;

  return apolloClient;
}

export function useApollo() {
  const store = useMemo(() => getApolloClient(), []);
  return store;
}

// Helper function to clear Apollo cache
export function clearApolloCache() {
  if (apolloClient && typeof window !== "undefined") {
    console.log('🗑️ Clearing Apollo cache...');
    apolloClient.cache.reset();
  }
}
