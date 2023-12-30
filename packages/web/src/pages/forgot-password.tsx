import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React, { useState } from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import {
    ForgotPasswordDocument
} from "../gql/graphql";
import { useMutation } from "@apollo/client";
import { createWithApollo } from "../utils/createWithApollo";

const ForgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [forgotPassword] = useMutation(ForgotPasswordDocument);

  return ( 
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          await forgotPassword({ variables: values }); // returning Promise to avoid forever spinning on Submit button

          setComplete(true);
        }}
      >
        {({ isSubmitting }) => (complete ? <Box>if an account with this email exists, we sent an email</Box> :
          <Form>
            <InputField
              name="email"
              placeholder="email"
              label="Email"
              type="email"
            />
            <Button
              mt={4}
              type="submit"
              colorScheme="teal"
              isLoading={isSubmitting}
            >
              forgot password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default createWithApollo<{}, {}>()({ssr: false})(ForgotPassword);
