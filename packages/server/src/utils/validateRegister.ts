import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput";
import { validatePassword } from "./validatePassword";

export const validateRegister = (options: UsernamePasswordInput) => {
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "invalid email",
      },
    ];
  }

  if (options.user.length <= 2) {
    return [
      {
        field: "user",
        message: "length must be greater than 2",
      },
    ];
  }

  if (options.user.includes("@")) {
    return [
      {
        field: "user",
        message: "cannot include @",
      },
    ];
  }

  return validatePassword(options.password, "password");
};
