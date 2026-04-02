import { ReactNode } from "react";
import { WorkspaceSidebar } from "./WorkspaceSidebar";

export function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <WorkspaceSidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
    </div>
  );
}
