import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { FormField } from "@/features/auth/components/FormField";

export default function LoginPage() {
  const { t } = useTranslation("auth");
  return (
    <>
      <h1 className="mb-4 text-center text-xl font-medium">
        {t("login.title")}
      </h1>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col gap-4">
          <FormField
            id="email"
            label={t("fields.email")}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />

          <FormField
            id="password"
            label={t("fields.password")}
            type="password"
            autoComplete="current-password"
            placeholder={t("fields.passwordPlaceholder")}
          />

          <Button type="submit" className="h-11 mb-2.5">
            {t("login.submit")}
          </Button>
        </div>
      </form>
    </>
  );
}
