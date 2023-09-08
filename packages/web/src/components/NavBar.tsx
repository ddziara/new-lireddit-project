import { Box, Button, Flex, Heading, Hide, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import {
  LogoutDocument,
  MeDocument,
  RegularUserFragmentDoc,
} from "../gql/graphql";
import { useQuery, useMutation } from "urql";
import { useFragment } from "../gql";
import { isServer } from "../utils/isServer";
import { useRouter } from "next/router";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = (props) => {
  const router = useRouter();
  const [{ fetching: logoutFetching }, logout] = useMutation(LogoutDocument);
  const [{ data, fetching }] = useQuery({
    query: MeDocument,
    pause: isServer(),
  });

  // https://stackoverflow.com/questions/65492456/while-turining-on-ssr-in-urql-clint-im-geting-the-below-error-did-not-expect-se
  //
  // The problem is that the MeQuery is paused for SSR and therefore the userInfoBody is being setup incorrectly 
  // before the client renders it after receiving the user data. Simple fix is to use the same isServer check on 
  // the userInfoBody setup:

  let body = null;

  if (isServer() || fetching) {
    // data is loading
  } else if (!data?.me) {
    // user not logged in
    body = (
      <>
        <Link as={NextLink} href="/login" mr={2}>
          login
        </Link>
        <Link as={NextLink} href="/register">
          register
        </Link>
      </>
    );
  } else {
    const regularUser = useFragment(RegularUserFragmentDoc, data.me);

    // user is logged in
    body = (
      <Flex align="center">
        <Button ml="auto" mr={4}>
          <Link as={NextLink} href="/create-post">
            create post
          </Link>
        </Button>
        <Box mr={2}>{regularUser.user}</Box>
        <Button
          variant="link"
          onClick={async () => {
            await logout({});
            router.reload();
          }}
          isLoading={logoutFetching}
        >
          logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="tan" p={4}>
      <Flex flex={1} m='auto' maxWidth={800} align="center">
        <Link as={NextLink} href="/">
          <Heading>LiReddit</Heading>
        </Link>
        <Box ml="auto">{body}</Box>
      </Flex>
    </Flex>
  );
};
