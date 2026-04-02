import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, Mail, Briefcase, BookOpen,
  Languages, Grid3X3, FolderOpen, Download, User, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState } from "react";

const sidebarItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "CV Builder", path: "/cv", icon: FileText },
  { label: "Cover Letters", path: "/cover-letter", icon: Mail },
  { label: "Jobs", path: "/jobs", icon: Briefcase },
  { label: "Books", path: "/books", icon: BookOpen },
  { label: "Translate", path: "/translate", icon: Languages },
  { label: "Templates", path: "/templates", icon: Grid3X3 },
  { label: "Library", path: "/library", icon: FolderOpen },
  { label: "Exports", path: "/exports", icon: Download },
  { label: "Profile", path: "/profile", icon: User },
];

export function WorkspaceSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden border-r bg-card transition-all duration-200 lg:flex lg:flex-col ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <div className="flex items-center justify-end p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2">
        {sidebarItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-surface-active text-primary"
                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
