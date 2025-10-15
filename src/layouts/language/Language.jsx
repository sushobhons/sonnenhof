import { useEffect, useState } from "react";
import usFlag from "../../assets/images/united-states-flags.png";
import frenchFlag from "../../assets/images/french-flag.png";

import i18n from "../../i18n";
import { useTranslation } from "react-i18next";
import { loadLanguage } from "../../utils/loadLanguage";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../utils/apiUrl";

const Language = ({ onSelectedLangData }) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(
    i18n.language || "en"
  );
  const [isLoading, setIsLoading] = useState(false);

  const toggleDiv = () => {
    setIsVisible((prev) => !prev);
  };

  const changeLanguage = async (lang) => {
    try {
      setIsLoading(true);
      await loadLanguage(lang);
      setIsVisible(false);
    } catch (error) {
      console.error("Error changing language:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFlag = (lang) => {
    return lang === "fr" ? frenchFlag : usFlag;
  };

  const getLanguageLabel = (lang) => {
    return lang === "fr" ? "Français" : "English";
  };

  const langTranslation = async () => {
    try {
      const apiRes = await fetch(
        `${API_BASE_URL}languages/${selectedLanguage}/translations`,
        {
          method: "GET",
        }
      );
      const responseData = await apiRes.json();
      if (responseData.success) {
        onSelectedLangData(responseData.data, selectedLanguage);
        // console.log(responseData.data,selectedLanguage)
      } else {
        toast.error(t("common.error"));
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.", {
        autoClose: 2000,
      });
      console.log(error);
    } finally {
    }
  };

  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setSelectedLanguage(lng);
    };

    i18n.on("languageChanged", handleLanguageChanged);
    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  useEffect(() => {
    langTranslation();
  }, [selectedLanguage]);

  return (
    <div className="left-top-buy-files">
      <ul className="top-buy-files-form-list">
        <li>
          <button
            key={selectedLanguage}
            className="language-btn"
            onClick={toggleDiv}
          >
            <span>
              <img
                src={getFlag(selectedLanguage)}
                alt={getLanguageLabel(selectedLanguage)}
              />
            </span>
            {getLanguageLabel(selectedLanguage)}
          </button>

          {isVisible && (
            <div className="language-dropdown">
              {isLoading ? (
                <div className="language-loading">Loading...</div>
              ) : (
                <ul>
                  <li onClick={() => changeLanguage("en")}>
                    <span>
                      <img src={usFlag} alt="English" />
                    </span>
                    English
                  </li>
                  <li onClick={() => changeLanguage("fr")}>
                    <span>
                      <img src={frenchFlag} alt="Français" />
                    </span>
                    Français
                  </li>
                </ul>
              )}
            </div>
          )}
        </li>
      </ul>
    </div>
  );
};

export default Language;
