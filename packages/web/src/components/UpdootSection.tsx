import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostSnippetFragment, VoteDocument } from "../gql/graphql";
import { useMutation } from "urql";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "updoot-loading" | "downdoot-loading" | "not-loading"
  >("not-loading");
  const [, /*{fetching}*/ vote] = useMutation(VoteDocument);
  // console.log(
  //   `[${Date.now()}] Rendering UpdootSection: post.voteStatus: `,
  //   post.voteStatus
  // );
  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
      <IconButton
        onClick={async () => {
          if (post.voteStatus === 1) {
            return;
          }

          setLoadingState("updoot-loading");
          await vote({ postId: post.id, value: 1 });
          setLoadingState("not-loading");
        }}
        colorScheme={post.voteStatus === 1 ? "green" : undefined}
        isLoading={loadingState === "updoot-loading" /* fetching */}
        aria-label="updoot post"
        icon={<ChevronUpIcon />}
      ></IconButton>
      {post.points}
      <IconButton
        onClick={async () => {
          if (post.voteStatus === -1) {
            return;  
          }

          setLoadingState("downdoot-loading");
          await vote({ postId: post.id, value: -1 });
          setLoadingState("not-loading");
        }}
        colorScheme={post.voteStatus === -1 ? "red" : undefined}
        isLoading={loadingState === "downdoot-loading" /* fetching */}
        aria-label="downdoot post"
        icon={<ChevronDownIcon />}
      ></IconButton>
    </Flex>
  );
};
