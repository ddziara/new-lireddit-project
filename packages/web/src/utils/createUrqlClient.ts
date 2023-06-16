import { fetchExchange } from "urql";
import { cacheExchange } from "@urql/exchange-graphcache";
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation, RegularErrorFragment, RegularErrorFragmentDoc, RegularUserFragment, RegularUserFragmentDoc, RegularUserResponseFragmentDoc } from "../gql/graphql";
import { useFragment } from "../gql";

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
                const regularUserResponseFragmentDoc = useFragment(
                  RegularUserResponseFragmentDoc,
                  result.login
                );
      
                let errors: readonly RegularErrorFragment[] | null | undefined;
                let user: RegularUserFragment | null | undefined
      
                if (regularUserResponseFragmentDoc) {
                  errors = useFragment(
                    RegularErrorFragmentDoc,
                    regularUserResponseFragmentDoc.errors
                  );
      
                  user = useFragment(
                      RegularUserFragmentDoc,
                      regularUserResponseFragmentDoc.user
                    );
                 }
      
                if (errors) {
                  return data;
                } else {
                  return {
                    me: user,
                  };
                }
              });
            },
            register: (result: RegisterMutation, args, cache, info) => {
              cache.updateQuery({ query: MeDocument }, (data: MeQuery | null) => {
                const regularUserResponseFragmentDoc = useFragment(
                  RegularUserResponseFragmentDoc,
                  result.register
                );
      
                let errors: readonly RegularErrorFragment[] | null | undefined;
                let user: RegularUserFragment | null | undefined
      
                if (regularUserResponseFragmentDoc) {
                  errors = useFragment(
                    RegularErrorFragmentDoc,
                    regularUserResponseFragmentDoc.errors
                  );
      
                  user = useFragment(
                      RegularUserFragmentDoc,
                      regularUserResponseFragmentDoc.user
                    );
                 }
      
                if (errors) {
                  return data;
                } else {
                  return {
                    me: user,
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
      credentials: "include" as const,
    },
  });
