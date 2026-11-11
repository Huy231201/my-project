import { useState } from "react";
import {
  ClipboardCheckIcon,
  CircleGauge,
  Menu,
  X,
  ListChecksIcon,
} from "lucide-react";
import { NavLink } from "react-router";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";

export default function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const navItems = [
    { title: t("sidebar.dashboard"), url: "/dashboard", icon: CircleGauge },
    { title: t("sidebar.tasks"), url: "/tasks", icon: ListChecksIcon },
  ];

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full text-primary-foreground bg-sidebar-primary lg:w-64 lg:min-h-screen"
    >
      <div className="relative flex h-14 px-4 items-center justify-center lg:justify-start">
        <CollapsibleTrigger className="absolute left-4 lg:hidden">
          <Menu
            className={clsx(
              "absolute inset-0 m-auto size-6 transition-all duration-500",
              isOpen
                ? "rotate-90 scale-0 opacity-0"
                : "rotate-0 scale-100 opacity-100",
            )}
          />

          <X
            className={clsx(
              "absolute inset-0 m-auto size-7 transition-all duration-500",
              isOpen
                ? "rotate-0 scale-100 opacity-100"
                : "rotate-90 scale-0 opacity-0",
            )}
          />
        </CollapsibleTrigger>

        <div className="flex items-center gap-2">
          <ClipboardCheckIcon className="size-5" />
          <h1 className="text-xl">Task Manager</h1>
        </div>
      </div>

      <nav
        className={clsx(
          "flex-col px-4",
          isOpen ? "flex" : "hidden",
          "lg:!flex",
        )}
      >
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={({ isActive }) =>
                clsx(
                  "flex gap-5 items-center px-3 h-12 rounded-md",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent",
                )
              }
            >
              <Icon className="size-4 text-muted-foreground" />
              <p className="text-sm">{item.title}</p>
            </NavLink>
          );
        })}
      </nav>
    </Collapsible>
  );
}
