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

interface NavBarProps {
}

export const NavBar: React.FC<NavBarProps> = (props) => {
  const [{ fetching: logoutFetching }, logout] = useMutation(LogoutDocument);
  const [{ data, fetching }] = useQuery({ query: MeDocument });

  let body = null;

  if (fetching) {
    // data is loading
  } else if (!data?.me) {
    // user not logged in
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>register</Link>
        </NextLink>
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
