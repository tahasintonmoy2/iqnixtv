import { ourFileRouter } from "@/app/api/uploadthing/core";
import QueryProvider from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { siteConfig } from "@/config/site";
import { AuthProvider } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { connection } from "next/server";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { extractRouterConfig } from "uploadthing/server";
import "uploadthing/tw/v4";
import "./globals.css";

async function UTSSR() {
  await connection();
  return <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />;
}

const geistSans = Roboto({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <meta name="screen-orientation" content="portrait" />
      <AuthProvider>
        <body className={cn(geistSans.className, "dark:bg-background")}>
          <Suspense>
            <UTSSR />
          </Suspense>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <Toaster position="bottom-left" richColors />
              {children}
            </ThemeProvider>
          </QueryProvider>
        </body>
      </AuthProvider>
    </html>
  );
}
