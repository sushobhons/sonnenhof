import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth/AuthProvider";
import "./i18n";
import { loadLanguage } from "./utils/loadLanguage";
import { ThemeProvider } from "./layouts/ThemeProvider";

// Step 1: Detect language from localStorage or browser
const browserLang = (
  navigator.languages?.[0] ||
  navigator.language ||
  "en"
).split("-")[0];
const lang = localStorage.getItem("SonnenhofLanguage") || browserLang || "en";

loadLanguage(lang).then(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <BrowserRouter basename="/sonnenhof/">
        {/* <BrowserRouter> */}
        <AuthProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
});
