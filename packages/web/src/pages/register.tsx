import React from "react";
import { Form, Formik } from "formik";
import { Box, Button } from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import {
  RegisterDocument,
  RegularErrorFragment,
  RegularErrorFragmentDoc,
  RegularUserFragment,
  RegularUserFragmentDoc,
  RegularUserResponseFragmentDoc,
} from "../gql/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { useFragment } from "../gql";
import { useMutation } from "@apollo/client";
import { createWithApollo } from "../utils/createWithApollo";

interface registerProps {}

// The below import defines which components come from formik
// import { Field, Form, Formik } from 'formik';

export const Register: React.FC<registerProps> = () => {
  const router = useRouter();
  const [register] = useMutation(RegisterDocument);

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "", user: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({ 
            variables: { options: values },
            update(cache, {data}) {
              if(data) {
                const { register } = data;

                const regularUserResponseFragment = useFragment(RegularUserResponseFragmentDoc, register);

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
            response.data?.register
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
          // console.log("errors: ", errors);
          // console.log("user: ", user);
          if (errors) {
            setErrors(toErrorMap(errors));
          } else if (user) {
            // worked
            router.push("/"); // go back to the home page
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="user" placeholder="username" label="Username" />
            <Box mt={4}>
              <InputField
                name="email"
                placeholder="email"
                label="Email"
                type="email"
              />
            </Box>
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              colorScheme="teal"
              isLoading={isSubmitting}
            >
              register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default createWithApollo<registerProps, registerProps>()({ssr: false})(Register);
