import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { FormField } from "@/features/auth/components/FormField";

export default function RegisterPage() {
  const { t } = useTranslation("auth");

  return (
    <>
      <h1 className="mb-4 text-center text-xl font-medium">
        {t("register.title")}
      </h1>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col gap-4">
          <FormField
            id="name"
            label={t("register.name")}
            type="text"
            autoComplete="name"
            placeholder={t("register.namePlaceholder")}
            required
          />

          <FormField
            id="email"
            label={t("fields.email")}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />

          <FormField
            id="password"
            label={t("fields.password")}
            type="password"
            autoComplete="new-password"
            placeholder={t("fields.passwordPlaceholder")}
            required
            minLength={8}
          />

          <Button type="submit" className="h-11 mb-2.5">
            {t("register.submit")}
          </Button>
        </div>
      </form>
    </>
  );
}
