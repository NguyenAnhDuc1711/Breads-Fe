"use client";

import { useTranslation } from "react-i18next";
import "./not-found.css";

const NotFound = () => {
  const { t } = useTranslation();

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="not-found-page">
      <div className="not-found-page__glow" />

      <div className="not-found-page__content">
        {/* Animated 404 number */}
        <div className="not-found-page__code-wrap">
          <span className="not-found-page__code-digit">4</span>
          <span className="not-found-page__code-zero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/bread-logo.png"
              alt="Breads logo"
              className="not-found-page__logo"
            />
          </span>
          <span className="not-found-page__code-digit">4</span>
        </div>

        <h1 className="not-found-page__title">{t("notFoundTitle")}</h1>
        <p className="not-found-page__description">{t("notFoundMsg")}</p>

        <div className="not-found-page__actions">
          <a
            href="/"
            className="not-found-page__btn not-found-page__btn--primary"
          >
            {t("goHome")}
          </a>
          <button

            type="button"
            className="not-found-page__btn not-found-page__btn--secondary"
            onClick={handleGoBack}
          >
            {t("goBack")}
          </button>
        </div>
      </div>
    </div>
  );
};


export default NotFound;
