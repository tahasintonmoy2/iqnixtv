import type React from "react";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-1">
        {/* <SidebarNav /> */}
        <main className="flex-1 overflow-auto">
          <div className="flex-1 space-y-4 p-4 pt-6 md:px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
