import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  InputProps,
  Textarea,
  TextareaProps,
} from "@chakra-ui/react";
import { FieldHookConfig, useField } from "formik";
import React from "react";

type ExtraInputProps = {
  label: string;
  textarea?: boolean;
};

type InputFieldProps = FieldHookConfig<any> & ExtraInputProps;

export const InputField: React.FC<InputFieldProps> = ({
  label,
  textarea,
  ...props
}) => {
  const [field, { error, touched }] = useField(props);

  return (
    <FormControl isInvalid={!!error && touched}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      {textarea ? (
        <Textarea {...field} {...(props as TextareaProps)} id={field.name} />
      ) : (
        <Input {...field} {...(props as InputProps)} id={field.name} />
      )}
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};
