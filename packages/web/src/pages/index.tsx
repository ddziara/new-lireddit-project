import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useQuery } from "urql";
import { PostsDocument } from "../gql/graphql";
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
import { isServer } from "../utils/isServer";
import { useState } from "react";

const Index = () => {
  const [variables, setVariables] = useState<{
    limit: number;
    cursor: string | null;
  }>({ limit: 10, cursor: null });

  const [{ data, fetching }] = useQuery({
    query: PostsDocument,
    variables,
  });

  console.log("variables: ", variables);

  if (!fetching && !data) {
    return <div>you got query failed for some reasons</div>;
  }

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
          {data!.posts.posts.map((p) => (
            <Box key={p.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{p.title}</Heading>
              <Text mt={4}>{p.textSnippet}</Text>
            </Box>
          ))}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
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
