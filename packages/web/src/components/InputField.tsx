import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  InputProps,
} from "@chakra-ui/react";
import { FieldHookConfig, useField } from "formik";
import React from "react";

type ExtraInputProps = {
  label: string;
};

type InputFieldProps = string | (FieldHookConfig<any> & ExtraInputProps);

export const InputField: React.FC<InputFieldProps> = (props) => {
  const [field, { error, touched }] = useField(props);
  const chakraInputProps = props as InputProps;

  return (
    <FormControl isInvalid={!!error && touched}>
      <FormLabel htmlFor={field.name}>
        {(props as ExtraInputProps).label}
      </FormLabel>
      <Input {...field} {...chakraInputProps} id={field.name} />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};
