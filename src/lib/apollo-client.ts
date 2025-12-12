import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import createUploadLink from "apollo-upload-client/public/createUploadLink.js";
import { useMemo } from "react";

let apolloClient: ApolloClient<any> | null = null;

export function getApolloClient() {
  // Error logging link - errors are handled by components
  const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
    // Only log in development for debugging
    if (process.env.NODE_ENV === 'development') {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => {
          // Skip authentication errors if no JWT token exists (expected behavior)
          if (message.includes('Authentication required')) {
            const hasToken = typeof window !== 'undefined' && window.localStorage.getItem('jwtToken');
            if (!hasToken) return; // Don't log if user isn't authenticated yet
          }
          // Skip known backend schema errors (temporary until backend fixes)
          if (message.includes('uninitialized constant GraphQL::Types::Decimal')) {
            console.warn('[Backend Schema Error]: Decimal type not defined in backend. Please update backend schema.');
            return;
          }
          console.error(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          );
        });
      }
      if (networkError) {
        console.error(`[Network error]: ${networkError}`, operation);
      }
    }
  });

  // Auth link - dynamically read JWT token on EVERY request
  const authLink = setContext((_, { headers }) => {
    // Get the JWT token from localStorage on each request
    const jwtToken =
      typeof window !== "undefined"
        ? window.localStorage.getItem("jwtToken")
        : null;

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
    apolloClient.cache.reset();
  }
}
