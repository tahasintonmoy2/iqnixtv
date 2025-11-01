import { auth } from "@/auth";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Roboto } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import "uploadthing/tw/v4";
import { connection } from "next/server";
import { Suspense } from "react";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import QueryProvider from "@/components/providers/query-provider";

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
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <meta name="screen-orientation" content="portrait" />
      <SessionProvider session={session}>
        <body className={cn(geistSans.className, "dark:bg-background")}>
          <Suspense>
            <UTSSR />
          </Suspense>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Toaster position="bottom-left" richColors />
              {children}
            </ThemeProvider>
          </QueryProvider>
        </body>
      </SessionProvider>
    </html>
  );
}
