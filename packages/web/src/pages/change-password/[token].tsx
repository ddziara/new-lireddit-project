import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import router, { useRouter } from "next/router";
import React, { useState } from "react";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { toErrorMap } from "../../utils/toErrorMap";
import { ChangePasswordDocument, RegularUserFragment } from "../../gql/graphql";
import { useFragment } from "../../gql";
import {
  RegularUserResponseFragmentDoc,
  RegularErrorFragmentDoc,
  RegularErrorFragment,
  RegularUserFragmentDoc,
} from "../../gql/graphql";
import NextLink from "next/link";
import { useMutation } from "@apollo/client";
import { createWithApollo } from "../../utils/createWithApollo";

export const ChangePassword: NextPage<{}> = () => {
  const router = useRouter();
  const [changePassword] = useMutation(ChangePasswordDocument);
  const [tokenError, setTokenError] = useState("");

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({ variables: {
            newPassword: values.newPassword,
            token: typeof router.query.token === "string" ? router.query.token : "",
          },
            update(cache, {data}) {
              if(data) {
                const { changePassword } = data;

                const regularUserResponseFragment = useFragment(RegularUserResponseFragmentDoc, changePassword);

                const regularErrorFragment = useFragment(RegularErrorFragmentDoc, regularUserResponseFragment.errors);
                const regularUserFragment = useFragment(RegularUserFragmentDoc, regularUserResponseFragment.user);

                if(!regularErrorFragment && regularUserFragment) {
                  cache.modify({fields: {
                    me() {
                      cache.writeFragment({fragment: RegularUserFragmentDoc, data: regularUserFragment})
                    }
                  }});
                  cache.evict({fieldName: "posts"});
                }
              }
            }
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

export default createWithApollo<{}, {}>()({ssr: false})(ChangePassword);
