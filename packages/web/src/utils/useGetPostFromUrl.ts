import { useQuery } from "@apollo/client";
import { PostDocument } from "../gql/graphql";
import { useGetIntId } from "./useGetIntId";

export const useGetPostFromUrl = () => {
  const intId = useGetIntId();
  return useQuery(PostDocument, { variables: { id: intId } });
};
