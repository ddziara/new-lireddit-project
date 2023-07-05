import {
  DocumentInput,
  ErrorLike,
  Exchange,
  TypedDocumentNode,
  fetchExchange,
  stringifyVariables,
} from "urql";
import { Resolver, cacheExchange } from "@urql/exchange-graphcache";
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  RegularErrorFragment,
  RegularErrorFragmentDoc,
  RegularUserFragment,
  RegularUserFragmentDoc,
  RegularUserResponseFragmentDoc,
} from "../gql/graphql";
import { useFragment } from "../gql";
import { pipe, tap } from "wonka";
import Router from "next/router";
import { FragmentDefinitionNode } from "@0no-co/graphql.web";

export const errorExchange: Exchange =
  ({ forward }) =>
  (ops$) => {
    return pipe(
      forward(ops$),
      tap(({ error }) => {
        // If the OperationResult has an error send a request to sentry
        if (error) {
          // the error is a CombinedError with networkError and graphqlErrors properties
          if (error.message.includes("not authenticated")) {
            Router.replace("/login");
          }
        }
      })
    );
  };

export const cursorPagination = (): Resolver<any, any, any> => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;

    if (size === 0) {
      // cache missed
      return undefined;
    }

    const results: string[] = [];
    const isItInTheCache = cache.resolve(entityKey, fieldName, fieldArgs);
    info.partial = !isItInTheCache; // indicates that some data is uncached
    let hasMore = true;

    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore") as boolean;

      if(!_hasMore) {
        hasMore = false;
      }

      results.push(...data);
    });

    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results,
    };

    // const visited = new Set();
    // let result: NullArray<string> = [];
    // let prevOffset: number | null = null;

    // for (let i = 0; i < size; i++) {
    //   const { fieldKey, arguments: args } = fieldInfos[i];
    //   if (args === null || !compareArgs(fieldArgs, args)) {
    //     continue;
    //   }

    //   const links = cache.resolve(entityKey, fieldKey) as string[];
    //   const currentOffset = args[offsetArgument];

    //   if (
    //     links === null ||
    //     links.length === 0 ||
    //     typeof currentOffset !== "number"
    //   ) {
    //     continue;
    //   }

    //   const tempResult: NullArray<string> = [];

    //   for (let j = 0; j < links.length; j++) {
    //     const link = links[j];
    //     if (visited.has(link)) continue;
    //     tempResult.push(link);
    //     visited.add(link);
    //   }

    //   if (
    //     (!prevOffset || currentOffset > prevOffset) ===
    //     (mergeMode === "after")
    //   ) {
    //     result = [...result, ...tempResult];
    //   } else {
    //     result = [...tempResult, ...result];
    //   }

    //   prevOffset = currentOffset;
    // }

    // const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
    // if (hasCurrentPage) {
    //   return result;
    // } else if (!(info as any).store.schema) {
    //   return undefined;
    // } else {
    //   info.partial = true;
    //   return result;
    // }
  };
};

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://192.168.0.8:4000/graphql",
  exchanges: [
    cacheExchange({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {
        Query: {
          posts: cursorPagination(),
        },
      },
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
              let user: RegularUserFragment | null | undefined;

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
              let user: RegularUserFragment | null | undefined;

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
    errorExchange /* probably should be before fetchExchange */,
    ssrExchange,
    fetchExchange,
  ],
  fetchOptions: {
    credentials: "include" as const,
  },
});
