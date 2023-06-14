import { ChakraProvider } from "@chakra-ui/react";

import theme from "../theme";
import { AppProps } from "next/app";
import { Client, fetchExchange, Provider } from "urql";
import { cacheExchange } from "@urql/exchange-graphcache";
import {
  LoginMutation,
  LogoutDocument,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from "../gql/graphql";

const client = new Client({
  url: "http://192.168.0.8:4000/graphql",
  exchanges: [
    cacheExchange({
      updates: {
        Mutation: {
          logout: (result: LogoutMutation, args, cache, info) => {
            cache.updateQuery({ query: MeDocument }, () => {
              return {
                me: null,
              };
            });
          },
          login: (result: LoginMutation, args, cache, info) => {
            cache.updateQuery({ query: MeDocument }, (data: MeQuery | null) => {
              if (result.login.errors) {
                return data;
              } else {
                return {
                  me: result.login.user,
                };
              }
            });
          },
          register: (result: RegisterMutation, args, cache, info) => {
            cache.updateQuery({ query: MeDocument }, (data: MeQuery | null) => {
              if (result.register.errors) {
                return data;
              } else {
                return {
                  me: result.register.user,
                };
              }
            });
          },
        },
      },
    }),
    fetchExchange,
  ],
  fetchOptions: {
    credentials: "include",
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  );
}

export default MyApp;
