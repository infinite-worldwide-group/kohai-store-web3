import { ApolloProvider } from "@apollo/client";
import React, { ReactNode } from "react";
import { useApollo } from "./apollo-client";

interface CustomApolloProviderProps {
  children: ReactNode;
}

const CustomApolloProvider: React.FC<CustomApolloProviderProps> = ({
  children,
}) => {
  const client = useApollo();

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default CustomApolloProvider;
