import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { FormField } from "@/features/auth/components/FormField";
import { useAuthForm } from "@/features/auth/hooks/useAuthForm";
import { useNavigate } from "react-router";
import {
  validateName,
  validateEmail,
  validatePassword,
} from "@/features/auth/validation";

const INITIAL_VALUES = {
  name: "",
  email: "",
  password: "",
};

const VALIDATORS = {
  name: validateName,
  email: validateEmail,
  password: validatePassword,
};

export default function RegisterPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const {
    values,
    errors,
    unexpected,
    success,
    loading,
    handleChange,
    handleSubmit,
  } = useAuthForm("register", INITIAL_VALUES, VALIDATORS, () =>
    navigate("/dashboard", { replace: true }),
  );

  return (
    <>
      <h1 className="mb-4 text-center text-xl font-medium">
        {t("register.title")}
      </h1>

      <form noValidate onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          <FormField
            id="name"
            label={t("register.name")}
            type="text"
            autoComplete="name"
            placeholder={t("register.namePlaceholder")}
            value={values.name}
            onChange={handleChange}
            error={errors.name && t(errors.name)}
          />

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
            autoComplete="new-password"
            placeholder={t("fields.passwordPlaceholder")}
            value={values.password}
            onChange={handleChange}
            error={errors.password && t(errors.password)}
          />

          {success && (
            <p className="text-sm text-green-600">{t("register.success")}</p>
          )}
          {unexpected && (
            <p className="text-sm text-destructive">{t("errors.unexpected")}</p>
          )}

          <Button type="submit" className="h-11 mb-2.5" disabled={loading}>
            {t("register.submit")}
          </Button>
        </div>
      </form>
    </>
  );
}
