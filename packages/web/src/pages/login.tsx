import React from "react";
import { Form, Formik } from "formik";
import {
  Box,
  Button,
} from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useMutation, useQuery } from "urql";
import { LoginDocument } from "../gql/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";

interface loginProps {}

// The below import defines which components come from formik
// import { Field, Form, Formik } from 'formik';

export const Login: React.FC<loginProps> = () => {
  const router = useRouter();
  const [, login] = useMutation(LoginDocument);

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ user: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({ options: values }); // returning Promise to avoid forever spinning on Submit button

          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            // worked
            router.push("/");   // go back to the home page
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="user" placeholder="username" label="Username" />
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
              login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Login;
