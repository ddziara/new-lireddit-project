import {
  DocumentInput,
  ErrorLike,
  Exchange,
  TypedDocumentNode,
  fetchExchange,
  stringifyVariables,
} from "urql";
import { Resolver, cacheExchange, Cache } from "@urql/exchange-graphcache";
import {
  DeletePostMutationVariables,
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
  VoteMutationVariables,
} from "../gql/graphql";
import { useFragment } from "../gql";
import { pipe, tap } from "wonka";
import Router from "next/router";
import { FragmentDefinitionNode } from "@0no-co/graphql.web";
import { gql } from "@urql/core";
import { devtoolsExchange } from "@urql/devtools";
import { isServer } from "./isServer";

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

      if (!_hasMore) {
        hasMore = false;
      }

      results.push(...data);
    });

    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results,
    };
  };
};

function invalidateAllPosts(cache: Cache) {
  // inspecting chache
  const allFields = cache.inspectFields("Query");
  const fieldInfoes = allFields.filter((info) => info.fieldName === "posts");

  fieldInfoes.forEach((fi) => {
    cache.invalidate("Query", "posts", fi.arguments);
  });
}

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie;

  if (isServer()) {
    // solves problem (together with "fetchOptions") of missing cookie (userId) when the first request is ssr
    // handling browser request by express midlewares adds missing cokie to headers
    cookie = ctx?.req?.headers?.cookie;
  }

  console.log("api url: ", process.env.NEXT_PUBLIC_API_URL);

  return {
    url: process.env.NEXT_PUBLIC_API_URL,
    exchanges: [
      devtoolsExchange,
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
            deletePost: (result: LogoutMutation, args, cache, info) => {
              cache.invalidate({
                __typename: "Post",
                id: (args as DeletePostMutationVariables).id,
              });
            },
            vote: (result: LogoutMutation, args, cache, info) => {
              const { postId, value } = args as VoteMutationVariables;
              // console.log("cache update: vote(): ", { postId, value });

              const data = cache.readFragment<{
                id: number;
                points?: number;
                voteStatus?: number;
              }>(
                gql`
                  fragment _ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId }
              );
              // console.log("data: ", data);

              if (data) {
                if (data.voteStatus === value) {
                  return;
                }

                const newPoints =
                  data.points! + (!data.voteStatus ? 1 : 2) * value;
                // console.log("newPoints: ", newPoints);
                cache.writeFragment(
                  gql`
                    fragment _ on Post {
                      points
                      voteStatus
                    }
                  `,
                  { id: postId, points: newPoints, voteStatus: value }
                );
              }
            },
            createPost: (result: LogoutMutation, args, cache, info) => {
              invalidateAllPosts(cache);
            },
            logout: (result: LogoutMutation, args, cache, info) => {
              cache.updateQuery({ query: MeDocument }, () => {
                return {
                  me: null,
                };
              });
            },
            login: (result: LoginMutation, args, cache, info) => {
              cache.updateQuery(
                { query: MeDocument },
                (data: MeQuery | null) => {
                  const regularUserResponse = useFragment(
                    RegularUserResponseFragmentDoc,
                    result.login
                  );

                  let errors:
                    | readonly RegularErrorFragment[]
                    | null
                    | undefined;
                  let user: RegularUserFragment | null | undefined;

                  if (regularUserResponse) {
                    errors = useFragment(
                      RegularErrorFragmentDoc,
                      regularUserResponse.errors
                    );

                    user = useFragment(
                      RegularUserFragmentDoc,
                      regularUserResponse.user
                    );
                  }

                  if (errors) {
                    return data;
                  } else {
                    return {
                      me: user,
                    };
                  }
                }
              );

              invalidateAllPosts(cache);
            },
            register: (result: RegisterMutation, args, cache, info) => {
              cache.updateQuery(
                { query: MeDocument },
                (data: MeQuery | null) => {
                  const regularUserResponse = useFragment(
                    RegularUserResponseFragmentDoc,
                    result.register
                  );

                  let errors:
                    | readonly RegularErrorFragment[]
                    | null
                    | undefined;
                  let user: RegularUserFragment | null | undefined;

                  if (regularUserResponse) {
                    errors = useFragment(
                      RegularErrorFragmentDoc,
                      regularUserResponse.errors
                    );

                    user = useFragment(
                      RegularUserFragmentDoc,
                      regularUserResponse.user
                    );
                  }

                  if (errors) {
                    return data;
                  } else {
                    return {
                      me: user,
                    };
                  }
                }
              );

              invalidateAllPosts(cache);
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
      headers: cookie ? { cookie } : undefined,
    },
  };
};
