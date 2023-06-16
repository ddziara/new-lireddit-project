import { Box, Button, Flex, Link } from "@chakra-ui/react";
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
  const [{ fetching: logoutFetching }, logout] = useMutation(LogoutDocument);
  const [{ data, fetching }] = useQuery({
    query: MeDocument,
    pause: isServer(),
  });

  // https://stackoverflow.com/questions/65492456/while-turining-on-ssr-in-urql-clint-im-geting-the-below-error-did-not-expect-se
  //
  // Instead of if (fetching) { }, add the useRouter hook: const { isReady } = useRouter();
  // and write if (fetching || !isReady) { }. This is some router issue with next.js
  const { isReady } = useRouter();

  let body = null;

  if (fetching && !isReady) {
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
      <Flex>
        <Box mr={2}>{regularUser.user}</Box>
        <Button
          variant="link"
          onClick={() => {
            logout({});
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
      <Box ml="auto">{body}</Box>
    </Flex>
  );
};
