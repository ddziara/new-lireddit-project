import { useRouter } from "next/router";
import { MeDocument } from "../gql/graphql";
import { useEffect } from "react";
import { isServer } from "./isServer";
import { useQuery } from "@apollo/client";

export const useIsAuth = () => {
  const { data, loading } = useQuery(MeDocument);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !data?.me) {
      router.replace("/login?next=" + router.pathname);
    }
  }, [loading, data, router]);
  
  return [loading];
};
