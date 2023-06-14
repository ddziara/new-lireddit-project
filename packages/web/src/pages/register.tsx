import React from "react";
import { Form, Formik } from "formik";
import {
  Box,
  Button,
} from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useMutation, useQuery } from "urql";
import { RegisterDocument } from "../gql/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";

interface registerProps {}

// The below import defines which components come from formik
// import { Field, Form, Formik } from 'formik';

export const Register: React.FC<registerProps> = () => {
  const router = useRouter();
  const [, register] = useMutation(RegisterDocument);

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ user: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({ options: values }); // returning Promise to avoid forever spinning on Submit button

          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
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
              register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
