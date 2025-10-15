import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import { useTranslation } from "react-i18next";
import ResellerSidebar from "@layouts/ResellerSidebar";
import ResellerHeader from "@layouts/ResellerHeader";

import useAuth from "../../auth/useAuth";
import { toast } from "react-toastify";

import copyIcon from "../../assets/images/copy-icon.svg";
import { IMAGE_URL } from "../../utils/apiUrl";
import { debounce } from "lodash";

function PanelConfiguration() {
  const [showIframe, setShowIframe] = useState(false);
  const { t } = useTranslation();
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const { user } = useAuth();
  const iframeContainerRef = useRef(null);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const subDomain = user?.username;
  const embedCode = `https://${subDomain}.file-service-portal.com`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      toast.success("Copied!", {
        theme: "dark",
        autoClose: 2000,
      });
    });
  };

  const debouncedUpdateProfile = useCallback(
    debounce((key, value) => {
      updateProfile(key, value);
    }, 300), // adjust delay as needed
    []
  );

  useEffect(() => {
    if (baseUrl && subDomain) {
      setShowIframe(true);
    }
  }, [baseUrl, subDomain]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get(`/reseller/profile`);
        const profile = response.data.data;

        setBgColor(profile.panel_background_color || "#ffffff");
        setTextColor(profile.panel_text_color || "#000000");
      } catch (error) {
        console.error("Failed to fetch reseller profile", error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="fullWidth">
      <div className="main">
        <ResellerSidebar />
        <div className="container">
          <ResellerHeader pageTitle={t("sidebar.panel_configuration")} />
          <div className="mainInnerDiv">
            <div className="resellerNav">
              <ul>
                <li>
                  <Link to="/admin/panel-configuration" className="active">
                    {t("reseller.panel.settings")}
                  </Link>
                </li>
                <li>
                  <Link to="/admin/information">
                    {t("reseller.information")}
                  </Link>
                </li>
                <li>
                  <Link to="/admin/cgu">{t("billing.cgu")}</Link>
                </li>
              </ul>
            </div>

            <div className="resellerForm holderContainer alertForm panelColor">
              <ul>
                <li>
                  <label>{t("reseller.bgcolor")}</label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBgColor(value);
                      debouncedUpdateProfile("panel_background_color", value);
                    }}
                  />
                </li>

                <li>
                  <label>{t("reseller.textcolor")}</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => {
                      const value = e.target.value;
                      setTextColor(value);
                      // updateProfile("panel_text_color", value);
                      debouncedUpdateProfile("panel_text_color", value);
                    }}
                  />
                </li>
                <li>
                  <label>{t("reseller.panel.url")}</label>
                  <div className="urlBox2">
                    <input
                      readOnly
                      value={embedCode}
                      className="input"
                      rows={10}
                      style={{ resize: "none", width: "100%" }}
                    />
                    <button onClick={handleCopy} className="copyButton">
                      <img src={copyIcon} alt="" />
                    </button>
                  </div>
                </li>
              </ul>
            </div>

            {/* <div id="vehicle-tuning-form" ref={iframeContainerRef}></div> */}
            {showIframe && embedCode && (
              <iframe
                src={embedCode}
                style={{ width: "100%", minHeight: "400px", border: "none" }}
                scrolling="no"
                title="Vehicle Tuning Form"
                allowFullScreen
                loading="lazy"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PanelConfiguration;
