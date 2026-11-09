import { useLoaderData } from "react-router";
import { useTranslation } from "react-i18next";

type Me = { id: string; name: string; email: string };

export default function DashboardPage() {
  const { t } = useTranslation();
  const user = useLoaderData() as Me;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-medium">
        {t("dashboard.greeting", { name: user.name })}
      </h1>
      <p className="text-muted-foreground">{user.email}</p>
    </div>
  );
}
