import { ApolloClient, InMemoryCache } from "@apollo/client";
import { withApollo } from "next-apollo";
import { PaginatedPosts } from "../gql/graphql";
import { NextPageContext } from "next";

const f1 = (ctx?: NextPageContext) => {
  // console.log(`-----------------------------@@ typeof window === "undefined": ${typeof window === "undefined"}`)
  // console.log(`-----------------------------@@ ctx?.req?.headers.cookie: ${ctx?.req?.headers.cookie}`)
  console.log(`-----------------------------@@ ctx?.req?.headers: ${ctx?.req?.headers}`)
  return (typeof window === "undefined" ? ctx?.req?.headers.cookie : undefined) || "";
}

const apolloClient = (ctx?: NextPageContext) => new ApolloClient({
  uri: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  headers: {
    // cookie: (typeof window === "undefined" ? ctx?.req?.headers.cookie : undefined) || ""
    cookie: f1(ctx)
  },
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          posts: {
            /* the following ignores field parameters & no new entry in cache is created */
            keyArgs: false,

            /* the following merges existing cache data for the field with a new page data */
            merge(
              existing: PaginatedPosts = { hasMore: false, posts: [] },
              { __typename, hasMore, posts }: PaginatedPosts,
              { args: cursor }
            ) {
              return {
                __typename,
                hasMore,
                posts: [...existing.posts, ...posts],
              };
            },
          },
        },
      },
    },
  }),
});

export const createWithApollo = <P, PI>() => withApollo<P, PI>(apolloClient);

