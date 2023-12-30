import React, { useEffect } from "react";
import { Button, Box } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { useRouter } from "next/router";
import { InputField } from "../components/InputField";
import { CreatePostDocument, PostSnippetFragmentDoc } from "../gql/graphql";
import { Layout } from "../components/Layout";
import { useIsAuth } from "../utils/useIsAuth";
import { useMutation } from "@apollo/client";
import { createWithApollo } from "../utils/createWithApollo";

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [fetching] = useIsAuth();
  const [createPost] = useMutation(CreatePostDocument);

  return !fetching ? (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values, { setErrors }) => {
          const { errors } = await createPost({ 
            variables: { input: values },
            update(cache) {
              cache.evict({ fieldName: "posts" });
            } 
          });

          if (!errors) {
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

export default createWithApollo<{}, {}>()({ssr: false})(CreatePost);
