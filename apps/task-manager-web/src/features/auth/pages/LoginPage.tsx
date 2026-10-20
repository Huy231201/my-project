import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { t } = useTranslation("auth");
  return (
    <>
      <h1 className="mb-4 text-center text-xl font-medium">
        {t("login.title")}
      </h1>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-sm font-medium">
              {t("login.email")}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="hover:border-input"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-sm font-medium">
              {t("login.password")}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Mật khẩu"
              className="hover:border-input"
            />
          </div>

          <Button type="submit" className="h-11 mb-2.5">
            {t("login.submit")}
          </Button>
        </div>
      </form>
    </>
  );
}
