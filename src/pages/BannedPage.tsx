"use client";

import { Button } from "../components/ui/primitives";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import "./BannedPage.css";

const BannedPage = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleGoBack = (): void => {
    localStorage.removeItem("userId");
    router.push("/");
  };

  return (
    <div className="banned-page">
      <div className="banned-page__stack">
        <p className="banned-page__title">{t("bannedTitle")}</p>
        <p className="banned-page__message">{t("bannedMsg")}</p>
        <Button className="btn-subtle" onClick={handleGoBack}>{t("goBack")}</Button>
      </div>
    </div>
  );
};

export default BannedPage;
