"use client";

import { Button } from "../components/ui/primitives";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import "./ErrorPage.css";

const ErrorPage = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleGoBack = (): void => {
    router.push("/");
  };

  return (
    <div className="error-page">
      <div className="error-page__stack">
        <p className="error-page__title">{t("errOops")}</p>
        <p className="error-page__message">{t("errMsg")}</p>
        <Button className="btn-subtle" onClick={handleGoBack}>{t("goBack")}</Button>
      </div>
    </div>
  );
};

export default ErrorPage;
