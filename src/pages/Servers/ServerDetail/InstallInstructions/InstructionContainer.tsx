import React, { PropsWithChildren } from "react";

function InstructionContainer({
  children,
}: {
  children: PropsWithChildren<React.ReactNode>;
}) {
  return <div>{children}</div>;
}

export default InstructionContainer;
