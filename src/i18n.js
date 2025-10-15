import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  resources: {}, // we'll load it dynamically
  lng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// console.log(i18n.language);

export default i18n;

// import API from "../api/axios";
// import i18n from "../i18n";

// const TRANSLATION_VERSION = "1.0"; // Change this when your translations update

// export const loadLanguage = async (lang) => {
//   const cacheKey = `translations_${lang}`;
//   const cache = JSON.parse(localStorage.getItem(cacheKey));

//   // If cached and version is same, use from cache
//   if (cache && cache.version === TRANSLATION_VERSION) {
//     i18n.addResources(lang, "translation", cache.data);
//     i18n.changeLanguage(lang);
//     localStorage.setItem("language", lang);
//     return;
//   }

//   try {
//     // Else fetch from backend
//     const { data } = await API.get(`/translations/${lang}`);

//     // Set in i18n
//     i18n.addResources(lang, "translation", data);
//     i18n.changeLanguage(lang);
//     localStorage.setItem("language", lang);

//     // Save to cache with version
//     localStorage.setItem(cacheKey, JSON.stringify({ version: TRANSLATION_VERSION, data }));
//   } catch (error) {
//     console.error("Failed to load language:", lang, error);
//   }
// };
