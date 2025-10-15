import API from "../api/axios";
import i18n from "../i18n";

export const loadLanguage = async (lang) => {
  try {
    const { data } = await API.get(`/translations/${lang}`);
    i18n.addResources(lang, "translation", data);
    await i18n.changeLanguage(lang);
    localStorage.setItem("CashTexLanguage", lang);
  } catch (error) {
    console.error("Failed to load language:", lang, error);
  }
};
