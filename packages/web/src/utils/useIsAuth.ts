import { useRouter } from "next/router";
import { useQuery } from "urql";
import { MeDocument } from "../gql/graphql";
import { useEffect } from "react";

export const useIsAuth = () => {
  const [{ data, fetching }] = useQuery({ query: MeDocument });
  const router = useRouter();
  useEffect(() => {
    if (!fetching && !data?.me) {
      router.replace("/login?next=" + router.pathname);
    }
  }, [fetching, data, router]);
  return [fetching];
};
