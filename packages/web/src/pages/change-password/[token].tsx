import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import router, { useRouter } from "next/router";
import React, { useState } from "react";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { toErrorMap } from "../../utils/toErrorMap";
import login from "../login";
import { useMutation } from "urql";
import { ChangePasswordDocument, RegularUserFragment } from "../../gql/graphql";
import { useFragment } from "../../gql";
import {
  RegularUserResponseFragmentDoc,
  RegularErrorFragmentDoc,
  RegularErrorFragment,
  RegularUserFragmentDoc,
} from "../../gql/graphql";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import NextLink from "next/link";

export const ChangePassword: NextPage<{}> = () => {
  const router = useRouter();
  const [, changePassword] = useMutation(ChangePasswordDocument);
  const [tokenError, setTokenError] = useState("");

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            newPassword: values.newPassword,
            token: typeof router.query.token === "string" ? router.query.token : "",
          }); // returning Promise to avoid forever spinning on Submit button

          const regularUserResponse = useFragment(
            RegularUserResponseFragmentDoc,
            response.data?.changePassword
          );

          let errors: readonly RegularErrorFragment[] | null | undefined;
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
            const errorMap = toErrorMap(errors);

            if ("token" in errorMap) {
              // special handling because "token" isn't in initial values
              setTokenError(errorMap.token);
            }

            setErrors(errorMap);
          } else if (user) {
            // worked
            router.push("/"); // go back to the home page
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="new password"
              label="New Password"
              type="password"
            />
            {tokenError ? (
              <Flex>
                <Box color="red" mr={2}>{tokenError}</Box>{" "}
                <Link as={NextLink} href="/forgot-password">
                  click here to get a new one
                </Link>
              </Flex>
            ) : null}
            <Button
              mt={4}
              type="submit"
              colorScheme="teal"
              isLoading={isSubmitting}
            >
              change password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
