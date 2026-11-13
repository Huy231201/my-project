import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Avatar from "react-avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Search, Bell, User, Settings, LogOut } from "lucide-react";
import { useLoaderData } from "react-router";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

type User = { id: string; name: string; email: string };

export default function AppHeader() {
  const user = useLoaderData() as User;
  const { t } = useTranslation();
  const menuItems = [
    { label: t("userMenu.profile"), icon: User },
    { label: t("userMenu.settings"), icon: Settings },
    { label: t("userMenu.logout"), icon: LogOut },
  ];

  return (
    <div className="flex items-center justify-between gap-3 py-2 px-2 lg:px-6  border border-b bg-background">
      <div className="relative flex-1 text-muted-foreground">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder={t("searchPlaceholder")}
          className="pl-9 placeholder:text-sm shadow-xs w-full max-w-sm"
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <LanguageSwitcher />
        <div className="flex items-center justify-center rounded-sm cursor-pointer w-10 h-10 hover:bg-muted">
          <Bell className="size-5" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                className="border-none flex items-center gap-2 rounded-sm cursor-pointer px-2 h-10 hover:bg-muted"
              >
                <Avatar
                  name={user.name}
                  maxInitials={2}
                  round={true}
                  size="30"
                  className="!bg-muted !text-primary !ring-1 !ring-border"
                />
                <p className="hidden lg:block">{user.name}</p>
              </Button>
            }
          />
          <DropdownMenuContent className="w-40 px-0 py-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <div key={item.label}>
                  {index === 2 && <DropdownMenuSeparator />}
                  <DropdownMenuItem className="flex px-3 py-2 gap-4 cursor-pointer hover:bg-muted hover:rounded-none">
                    <Icon />
                    <p>{item.label}</p>
                  </DropdownMenuItem>
                </div>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
