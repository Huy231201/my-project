import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { FormField } from "@/features/auth/components/FormField";
import { useAuthForm } from "@/features/auth/hooks/useAuthForm";
import {
  validateEmail,
  validateLoginPassword,
} from "@/features/auth/validation";

const INITIAL_VALUES = {
  email: "",
  password: "",
};

const VALIDATORS = {
  email: validateEmail,
  password: validateLoginPassword,
};

export default function LoginPage() {
  const { t } = useTranslation("auth");
  const {
    values,
    errors,
    unexpected,
    success,
    loading,
    handleChange,
    handleSubmit,
  } = useAuthForm("login", INITIAL_VALUES, VALIDATORS);

  return (
    <>
      <h1 className="mb-4 text-center text-xl font-medium">
        {t("login.title")}
      </h1>

      <form noValidate onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          <FormField
            id="email"
            label={t("fields.email")}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={handleChange}
            error={errors.email && t(errors.email)}
          />

          <FormField
            id="password"
            label={t("fields.password")}
            type="password"
            autoComplete="current-password"
            placeholder={t("fields.passwordPlaceholder")}
            value={values.password}
            onChange={handleChange}
            error={errors.password && t(errors.password)}
          />

          {success && (
            <p className="text-sm text-green-600">{t("login.success")}</p>
          )}
          {unexpected && (
            <p className="text-sm text-destructive">{t("errors.unexpected")}</p>
          )}

          <Button type="submit" className="h-11 mb-2.5" disabled={loading}>
            {t("login.submit")}
          </Button>
        </div>
      </form>
    </>
  );
}
