import { fetchExchange } from "urql";
import { cacheExchange } from "@urql/exchange-graphcache";
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from "../gql/graphql";

export const createUrqlClient = (ssrExchange: any) => ({
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
      ssrExchange,
      fetchExchange,
    ],
    fetchOptions: {
      credentials: "include",
    },
  });
