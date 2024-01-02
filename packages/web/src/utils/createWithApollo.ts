import { ApolloClient, InMemoryCache } from "@apollo/client";
import { withApollo } from "next-apollo";
import { PaginatedPosts } from "../gql/graphql";
import { NextPageContext } from "next";

const apolloClient = (ctx?: NextPageContext) => new ApolloClient({
  uri: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  headers: {
    cookie: (typeof window === "undefined" ? ctx?.req?.headers.cookie : undefined) || ""
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

