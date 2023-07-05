import React from "react";
import { Wrapper, WrapperVariant } from "./Wrapper";
import { NavBar } from "./NavBar";
import { Box } from "@chakra-ui/react";

interface LayoutProps {
  variant?: WrapperVariant;
  children: any;
}

export const Layout: React.FC<LayoutProps> = ({ variant, children }) => {
  return (
    <>
      <Box position="fixed" top={0} w="100%" zIndex={1}>
        <NavBar />
      </Box>
      <Box mt={20}>
        <Wrapper variant={variant}>{children}</Wrapper>
      </Box>
    </>
  );
};
