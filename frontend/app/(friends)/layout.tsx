import React, { ReactNode } from "react";

const ChatLayout = ({ children }: { children: ReactNode }) => {
  return <main className="h-screen">{children}</main>;
};

export default ChatLayout;
