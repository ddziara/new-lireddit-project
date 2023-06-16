export const validatePassword = (password: string, fieldName: string) => {
  if (password.length <= 3) {
    return [
      {
        field: fieldName,
        message: "length must be greater than 3",
      },
    ];
  }

  return null;
};
