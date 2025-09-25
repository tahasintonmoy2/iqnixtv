import { Navbar } from "@/components/navbar";
import { ModalProvider } from "@/components/providers/modal-provider";
import React, { ReactNode } from "react";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <Navbar />
      <main>
        <ModalProvider />
        {children}
        {/* <Footer /> */}
      </main>
    </div>
  );
};

export default RootLayout;
