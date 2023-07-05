import React, { useEffect } from "react";
import { Wrapper } from "../components/Wrapper";
import { Button, Box } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { useRouter } from "next/router";
import { InputField } from "../components/InputField";
import { useFragment } from "../gql";
import {
  RegularUserResponseFragmentDoc,
  RegularErrorFragment,
  RegularUserFragment,
  RegularErrorFragmentDoc,
  RegularUserFragmentDoc,
  CreatePostDocument,
  MeDocument,
} from "../gql/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import login from "./login";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useMutation, useQuery } from "urql";
import { Layout } from "../components/Layout";
import { useIsAuth } from "../utils/useIsAuth";

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [fetching] = useIsAuth();
  const [, createPost] = useMutation(CreatePostDocument);

  return !fetching ? (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values, { setErrors }) => {
          const { error } = await createPost({ input: values });

          if (!error) {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="title" label="Title" />
            <Box mt={4}>
              <InputField
                textarea
                name="text"
                placeholder="text..."
                label="Body"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              colorScheme="teal"
              isLoading={isSubmitting}
            >
              create post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  ) : (
    <Box />
  );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
