import React from "react";
import { Form, Formik } from "formik";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useMutation, useQuery } from "urql";
import {
  LoginDocument,
  RegularErrorFragment,
  RegularErrorFragmentDoc,
  RegularUserFragment,
  RegularUserFragmentDoc,
  RegularUserResponseFragmentDoc,
} from "../gql/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import { useFragment } from "../gql";
import NextLink from "next/link";
import { isServer } from "../utils/isServer";

interface loginProps {}

// The below import defines which components come from formik
// import { Field, Form, Formik } from 'formik';

export const Login: React.FC<loginProps> = () => {
  const router = useRouter();
  const [, login] = useMutation(LoginDocument);

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values); // returning Promise to avoid forever spinning on Submit button

          const regularUserResponseFragmentDoc = useFragment(
            RegularUserResponseFragmentDoc,
            response.data?.login
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
            setErrors(toErrorMap(errors));
          } else if (user) {
            // worked
            const p = router.query.next;

            router.push(typeof p === "string" ? p : "/"); // go back to the next page or the home page
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="usernameOrEmail"
              placeholder="username or email"
              label="Username or Email"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Flex mt={2}>
              <Link ml="auto" as={NextLink} href="/forgot-password">
                forgot password?
              </Link>
            </Flex>
            <Button
              mt={4}
              type="submit"
              colorScheme="teal"
              isLoading={isSubmitting}
            >
              login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
