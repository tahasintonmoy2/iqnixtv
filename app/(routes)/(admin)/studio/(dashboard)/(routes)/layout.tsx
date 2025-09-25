import { Navbar } from "@/components/console-navbar";
import { ModalProvider } from "@/components/providers/modal-provider";
import { SidebarRoutes } from "@/components/sidebar-nav";
import { siteConfig } from "@/config/site";
import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Iqnix CMS",
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

const layout = async ({
  children,
}: {
  children: ReactNode;
}) => {

  return (
    <div className="h-full">
      <div className="lg:fixed w-full z-50">
        <Navbar />
      </div>
      <div className="h-full top-20 w-56 flex-col lg:fixed inset-y-0 z-10">
        <SidebarRoutes />
      </div>
      
      {/* <CommandBar items={courses} /> */}
      <main className="md:pl-56 pt-[80px] lg:mx-4 h-full">
        <ModalProvider />
        {children}
      </main>
    </div>
  );
};

export default layout;