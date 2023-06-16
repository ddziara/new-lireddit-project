import { RegularErrorFragment } from "../gql/graphql";

export const toErrorMap = (errors: readonly RegularErrorFragment[]) => {
  const errorMap: Record<string, string> = {};

  errors.forEach(({ field, message }) => {
    errorMap[field] = message;
  });

  return errorMap;
};
