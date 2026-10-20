import { Outlet, useLocation, Link } from "react-router";
import { ClipboardCheckIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function AuthLayout() {
  const { pathname } = useLocation();
  const isLogin = pathname === "/login";
  const { t } = useTranslation(["auth", "common"]);
  const footer = isLogin
    ? {
        question: t("switch.noAccount"),
        to: "/register",
        action: t("switch.register"),
      }
    : {
        question: t("switch.hasAccount"),
        to: "/login",
        action: t("switch.login"),
      };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-[18px] bg-muted">
      <div className="fixed right-4 top-4">
        <LanguageSwitcher />
      </div>

      <div className="flex items-center gap-[15px]">
        <ClipboardCheckIcon className="size-5 text-primary" />
        <p className="text-2xl font-medium">{t("common:appName")}</p>
      </div>

      <div className="box-border w-full max-w-[500px] rounded-lg border border-border bg-card px-5 py-[18px] shadow-sm">
        <Outlet />
      </div>

      <p className="text-sm text-muted-foreground font-light">
        {footer.question}{" "}
        <Link to={footer.to} className="text-primary hover:underline">
          {footer.action}
        </Link>
      </p>
    </div>
  );
}
