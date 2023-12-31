import React from "react";
import NextLink from "next/link";
// import { useMutation, useQuery } from "urql";
import {
  DeletePostDocument,
  MeDocument,
  PostsDocument,
  RegularUserFragmentDoc,
} from "../gql/graphql";
import { Box, IconButton, Link } from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { isServer } from "../utils/isServer";
import { useFragment } from "../gql";
import { useMutation, useQuery } from "@apollo/client";

interface EditDeletePostsButtonsProps {
  id: number;
  creatorId: number;
}

export const EditDeletePostsButtons: React.FC<EditDeletePostsButtonsProps> = ({
  id,
  creatorId,
}) => {
  const { data: meData } = useQuery(MeDocument, { skip: isServer() });
  const regularUser = useFragment(RegularUserFragmentDoc, meData?.me);

  const [deletePost] = useMutation(DeletePostDocument);

  if (regularUser?.id !== creatorId) {
    return null;
  }

  return (
    <Box>
      <Link as={NextLink} href={`/post/edit/${id}`} mr={4}>
        <IconButton aria-label="Edit Post" icon={<EditIcon />} />
      </Link>
      <IconButton
        aria-label="Delete Post"
        icon={<DeleteIcon />}
        onClick={() => {
          deletePost({ 
            variables: { id }, 
            update(cache) {
              cache.evict({ id: "Post:" + id});
            }
          });
        }}
      />
    </Box>
  );
};
