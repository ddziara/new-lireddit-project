interface IFieldError {
  field: string;
  message: string;
}

export const toErrorMap = (errors: IFieldError[]) => {
  const errorMap: Record<string, string> = {};

  errors.forEach(({ field, message }) => {
    errorMap[field] = message;
  });

  return errorMap;
};
