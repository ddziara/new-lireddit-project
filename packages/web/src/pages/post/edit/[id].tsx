import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "urql";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import { PostDocument, UpdatePostDocument } from "../../../gql/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useGetIntId } from "../../../utils/useGetIntId";

export const EditPost = ({}) => {
  const router = useRouter();
  const intId = useGetIntId();

  const [{ data, fetching }] = useQuery({
    query: PostDocument,
    variables: { id: intId },
  });

  const [, updatePost] = useMutation(UpdatePostDocument);

  if (fetching) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  }
  // console.log("data!.post!: ", {title: data!.post!.title, text: data!.post!.text});

  return (
    <Layout variant="small">      
      <Formik
        initialValues={{ title: data!.post!.title, text: data!.post!.text }}
        onSubmit={async (values, { setErrors }) => {
          await updatePost({ id: intId, ...values });
          // router.push("/");
          router.back();
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
              update post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>    
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);
