import { useQuery } from "urql";
import { PostDocument } from "../gql/graphql";
import { useGetIntId } from "./useGetIntId";

export const useGetPostFromUrl = () => {
  const intId = useGetIntId();
  return useQuery({ query: PostDocument, variables: { id: intId } });
};
