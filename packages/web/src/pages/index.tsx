import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useQuery } from "urql";
import { PostsDocument, PostSnippetFragmentDoc } from "../gql/graphql";
import { Layout } from "../components/Layout";
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useState } from "react";
import { useFragment } from "../gql";
import { UpdootSection } from "../components/UpdootSection";
import { isServer } from "../utils/isServer";

const Index = () => {
  const [variables, setVariables] = useState<{
    limit: number;
    cursor: string | null;
  }>({ limit: 15, cursor: null });

  const [{ data, fetching }] = useQuery({
    query: PostsDocument,
    variables,
  });

  if (!fetching && !data) {
    return <div>you got query failed for some reasons</div>;
  }

  console.log(isServer() ? "...Index rendering on server" : "...Index rendering on client")

  return (
    <Layout>
      <Flex align="center">
        <Heading>LiReddit</Heading>
        <Link ml="auto" as={NextLink} href="/create-post">
          create post
        </Link>
      </Flex>
      <br />
      {!data && fetching ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((p) => {
            const postSnippet = useFragment(PostSnippetFragmentDoc, p);

            return (
              <Flex key={postSnippet.id} p={5} shadow="md" borderWidth="1px">
                <UpdootSection post={postSnippet} />
                <Box>
                  <Heading fontSize="xl">{postSnippet.title}</Heading>
                  <Text>posted by {postSnippet.creator.user}</Text>
                  <Text mt={4}>{postSnippet.textSnippet}</Text>
                </Box>
              </Flex>
            );
          })}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              const postSnippet = useFragment(PostSnippetFragmentDoc, data.posts.posts[data.posts.posts.length - 1]);

              setVariables({
                limit: variables.limit,
                cursor: postSnippet.createdAt,
              });
            }}
            isLoading={fetching}
            m="auto"
            my={8}
          >
            load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
