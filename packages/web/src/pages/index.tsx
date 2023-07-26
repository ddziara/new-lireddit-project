import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useState } from "react";
import { useQuery } from "urql";
import { EditDeletePostsButtons } from "../components/EditDeletePostsButtons";
import { Layout } from "../components/Layout";
import { UpdootSection } from "../components/UpdootSection";
import { useFragment } from "../gql";
import {
  MeDocument,
  PostSnippetFragmentDoc,
  PostsDocument,
  RegularUserFragmentDoc,
} from "../gql/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
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

  console.log(
    isServer() ? "...Index rendering on server" : "...Index rendering on client"
  );

  return (
    <Layout>
      {!data && fetching ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((p) => {
            const postSnippet = useFragment(PostSnippetFragmentDoc, p);
            // console.log("p: ", p);

            return !p ? null : (
              <Flex key={postSnippet.id} p={5} shadow="md" borderWidth="1px">
                <UpdootSection post={postSnippet} />
                <Box flex={1}>
                  <Link as={NextLink} href={`/post/${postSnippet.id}`}>
                    <Heading fontSize="xl">{postSnippet.title}</Heading>
                  </Link>
                  <Text>posted by {postSnippet.creator.user}</Text>
                  <Flex align="center">
                    <Text flex={1} mt={4}>
                      {postSnippet.textSnippet}
                    </Text>
                      <Box ml="auto">
                        <EditDeletePostsButtons id={postSnippet.id} creatorId={postSnippet.creator.id} />
                      </Box>
                  </Flex>
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
              const postSnippet = useFragment(
                PostSnippetFragmentDoc,
                data.posts.posts[data.posts.posts.length - 1]
              );

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
