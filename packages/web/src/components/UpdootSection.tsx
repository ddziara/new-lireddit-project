import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostSnippetFragment, PostSnippetFragmentDoc, VoteDocument } from "../gql/graphql";
import { ApolloCache, useMutation } from "@apollo/client";
// import { useMutation } from "urql";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

const updateAfterVote = (value: number, postId: number, cache: ApolloCache<any>) => {
  cache.updateFragment({ 
    id: "Post:" + postId, 
    fragment: PostSnippetFragmentDoc 
  },
  data => {
    if(data) {
      if (data.voteStatus === value) {
        return;
      }

      return ({ ...data, points: data.points + (!data.voteStatus ? 1 : 2) * value, voteStatus: value });
    }
   }
  );
};

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "updoot-loading" | "downdoot-loading" | "not-loading"
  >("not-loading");
  const [vote] = useMutation(VoteDocument);
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

          await vote({ 
            variables: { postId: post.id, value: 1 },
            update(cache) {
              updateAfterVote(1, post.id, cache);
            }
          });

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

          await vote({ 
            variables: { postId: post.id, value: -1 },
            update(cache) {
              updateAfterVote(-1, post.id, cache);
            }
          });

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
