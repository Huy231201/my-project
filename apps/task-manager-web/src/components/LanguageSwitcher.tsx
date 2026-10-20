import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const current = i18n.resolvedLanguage;

  const next = current === "vi" ? "en" : "vi";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => i18n.changeLanguage(next)}
    >
      {current?.toUpperCase()}
    </Button>
  );
}
