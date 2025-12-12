import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";
import { useTranslation } from "react-i18next";
import { loadLanguage } from "../utils/loadLanguage";
import i18n from "../i18n";
import { toast } from "react-toastify";
import API from "../api/axios";
import { CircularProgress, Modal, Box } from "@mui/material";
import { useTheme } from "./ThemeProvider";

// import images
import UserImg from "../assets/images/user-img.svg";
import BellImg from "../assets/images/bell-icon.svg";
import CountryImg from "../assets/images/country-img.svg";
import modalCrossIcon from "../assets/images/modal-cross-icon.png";
import defaultProfileImg from "../assets/images/default-profile-img.png";
import uploadIcon from "../assets/images/upload-icon2.png";
import uploadIcon2 from "../assets/images/upload-icon3.png";
import loaderImg from "../assets/images/loader.gif";
import { deFlag, usFlag, hrFlag } from "@/assets/images";
import lineIcon from "../assets/images/menu-line.svg";

const Header = ({ pageTitle }) => {
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  // This toggles local collapsed state (if you use it elsewhere)
  const toggleSidebar = () => {
    setCollapsed((s) => !s);
    // optional: toggle classes for desktop collapse if you use them
    const sidebarEl = document.querySelector(".sidebar");
    if (sidebarEl) sidebarEl.classList.toggle("collapsed");
    const rootContainer = document.querySelector(".container");
    if (rootContainer) rootContainer.classList.toggle("sidebar-collapsed");
  };

  // MOBILE: toggle the sidebar open/closed (uses CSS .sidebar-open and body .sidebar-hidden)
  const toggleMobileMenu = () => {
    const sidebarEl = document.querySelector(".sidebar");
    if (!sidebarEl) return;
    sidebarEl.classList.toggle("sidebar-open");
    document.body.classList.toggle("sidebar-hidden");
  };

  // If component unmounts ensure we remove mobile classes so layout doesn't get stuck
  useEffect(() => {
    return () => {
      const sidebarEl = document.querySelector(".sidebar");
      if (sidebarEl && sidebarEl.classList.contains("sidebar-open")) {
        sidebarEl.classList.remove("sidebar-open");
      }
      if (document.body.classList.contains("sidebar-hidden")) {
        document.body.classList.remove("sidebar-hidden");
      }
    };
  }, []);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDropdownOpen2, setIsDropdownOpen2] = useState(false);
  const [selectedLang, setSelectedLang] = useState(i18n.language);
  const [selectedFlag, setSelectedFlag] = useState(() => {
    switch (i18n.language) {
      case "de":
        return deFlag;
      case "hr":
        return hrFlag;
      default:
        return usFlag; // english default
    }
  });
  const { user, logout, updateUser } = useAuth();
  const profileImage = user?.profile_pic || null;

  const navigate = useNavigate();
  const { t } = useTranslation();
  const dropdownRef1 = useRef(null);
  const dropdownRef2 = useRef(null);
  const [accountModal, setAccountModal] = useState(false);
  const [imageUploadLoader, setImageUploadLoader] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountDetails, setAccountDetails] = useState({
    name: user?.name,
    email: user?.email,
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
  });

  const handleLogout = () => {
    // ensure mobile sidebar closes on logout
    const sidebarEl = document.querySelector(".sidebar");
    if (sidebarEl) sidebarEl.classList.remove("sidebar-open");
    document.body.classList.remove("sidebar-hidden");

    logout();
    navigate("/");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  const toggleDropdown2 = () => {
    setIsDropdownOpen2((prev) => !prev);
  };

  const handleLanguageChange = async (lang) => {
    setIsDropdownOpen2(false);

    await loadLanguage(lang);
    setSelectedLang(lang);

    switch (lang) {
      case "de":
        setSelectedFlag(deFlag);
        break;

      case "hr":
        setSelectedFlag(hrFlag);
        break;

      default:
        setSelectedFlag(usFlag);
        break;
    }
  };

  const getLanguageName = (code) => {
    switch (code) {
      case "en":
        return "English";
      case "de":
        return "Deutsch";
      default:
        return code;
    }
  };

  const validateAccountSettings = () => {
    let isValid = true;
    let newErrors = { ...errors };

    if (!accountDetails.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else {
      newErrors.name = "";
    }

    setErrors(newErrors);
    return isValid;
  };

  const updateAccount = async (event, type) => {
    if (type == "edit") {
      try {
        if (!validateAccountSettings()) {
          return;
        }
        setAccountLoading(true);
        const formData = new FormData();
        formData.append("name", accountDetails?.name);

        const apiRes = await API.post(`/admin/profile-picture`, formData);
        if (apiRes.data.status) {
          toast.success(apiRes.data.message, {
            theme: "dark",
            autoClose: 2000,
          });

          if (apiRes.data.data?.name) {
            updateUser({ name: apiRes.data.data.name });
          }
        } else {
          toast.error(apiRes.data.message, {
            theme: "dark",
            autoClose: 2000,
          });
        }
      } catch (error) {
        console.log(error);
        toast.error(t("common.error"), { theme: "dark", autoClose: 2000 });
      } finally {
        setAccountLoading(false);
      }
    } else if (type == "profile-image") {
      const file = event.target.files[0];
      if (file) {
        const fileType = file.type.split("/")[0];
        if (fileType === "image") {
          const imageUrl = URL.createObjectURL(file);
          try {
            setImageUploadLoader(true);
            const formData = new FormData();
            formData.append("profile_pic", event.target.files[0]);
            const apiRes = await API.post(`/admin/profile-picture`, formData, {
              headers: {
                "Content-Type": "multipart/formdata",
              },
            });

            if (apiRes.data.status) {
              toast.success(apiRes.data.message, {
                theme: "dark",
                autoClose: 2000,
              });
              if (apiRes.data.data?.profile_pic) {
                updateUser({ profile_pic: apiRes.data.data.profile_pic });
              }
            }
          } catch (error) {
            console.error(error);
          } finally {
            setImageUploadLoader(false);
          }
        } else {
          toast.error("Please upload a valid image file", {
            autoClose: 2000,
          });
        }
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef1.current &&
        !dropdownRef1.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        dropdownRef2.current &&
        !dropdownRef2.current.contains(event.target)
      ) {
        setIsDropdownOpen2(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef1, dropdownRef2]);

  return (
    <div className="app-header">
      {/* Mobile menu toggle - visible via CSS on small screens */}
      <button
        className="mobile-menu-btn"
        onClick={() => {
          // dispatch event handled by Sidebar
          window.dispatchEvent(new Event("toggleSidebar"));
        }}
        aria-label="Toggle menu"
        aria-expanded={document.body.classList.contains("sidebar-open")}
        style={{
          background: "transparent",
          border: "none",
          marginRight: 12,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img src={lineIcon} alt="menu" style={{ width: 20, height: 20 }} />
      </button>

      {/* <h2 className="app-header__title">{t(pageTitle)}</h2> */}

      <div className="app-header__right">
        {/* Notifications */}
        {/* <div className="app-header__notifications">
      <img src={BellImg} alt="" />
    </div> */}

        {/* User Dropdown */}
        <div className="app-header__dropdown" ref={dropdownRef1}>
          <div className="app-header__user" onClick={toggleDropdown}>
            <img
              src={profileImage ? profileImage : defaultProfileImg}
              alt="profile-image"
              style={{ width: "34px", height: "32px", borderRadius: "100%" }}
            />
            {user?.name ? `${user.name}` : "Admin"}
          </div>

          <ul
            className={`app-header__dropdown-menu ${isDropdownOpen ? "open" : ""
              }`}
          >
            <li className="app-header__dropdown-item">
              <Link to="/dashboard" className="app-header__dropdown-link">
                {t("dashboard.title")}
              </Link>
            </li>
            <li className="app-header__dropdown-item">
              <button onClick={handleLogout} className="app-header__logout-btn">
                {t("dashboard.logout")}
              </button>
            </li>
          </ul>
        </div>

        {/* Language Dropdown */}
        <div className="app-header__dropdown" ref={dropdownRef2}>
          <div className="app-header__user" onClick={toggleDropdown2}>
            <img src={selectedFlag} alt="country" />
          </div>
          <ul className={`app-header__dropdown-menu ${isDropdownOpen2 ? "open" : ""}`}>
            <li className="app-header__dropdown-item">
              <button onClick={() => handleLanguageChange("en")} className="app-header__logout-btn">
                <img src={usFlag} alt="English" className="lang-flag" />
                {t("common.english", { defaultValue: "English" })}
              </button>
            </li>

            <li className="app-header__dropdown-item">
              <button onClick={() => handleLanguageChange("de")} className="app-header__logout-btn">
                <img src={deFlag} alt="German" className="lang-flag" />
                {t("common.german", { defaultValue: "German" })}
              </button>
            </li>

            <li className="app-header__dropdown-item">
              <button onClick={() => handleLanguageChange("hr")} className="app-header__logout-btn">
                <img src={hrFlag} alt="Croatian" className="lang-flag" />
                {t("common.croatian", { defaultValue: "Croatian" })}
              </button>
            </li>
          </ul>
        </div>

        <div className="app-header__theme-toggle">
          <button
            onClick={toggleTheme}
            className="app-header__theme-btn"
            aria-label={
              theme === "light"
                ? "Switch to dark theme"
                : "Switch to light theme"
            }
            title={
              theme === "light"
                ? "Switch to dark theme"
                : "Switch to light theme"
            } // tooltip
          >
            {theme === "light" ? (
              // Moon (solid) → indicates dark mode
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M21.64 13.65A9 9 0 0110.35 2.36a9 9 0 1011.29 11.29z" />
              </svg>
            ) : (
              // Sun (outlined) → indicates light mode
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Account Modal */}
      <Modal
        open={accountModal}
        onClose={() => setAccountModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="modal-box my-account-modal-box">
          <div className="modal-header">
            <button
              className="modal-header__close-btn"
              onClick={() => setAccountModal(false)}
            >
              <img src={modalCrossIcon} alt="" />
            </button>
            <h3 className="modal-header__title">
              {t("password.personal_information")}
            </h3>
          </div>

          <div className="modal-body">
            <ul className="form-list signup-form-list">
              <li>
                <div className="upload-profile-box">
                  {imageUploadLoader ? (
                    <>
                      <img src={loaderImg} alt="Profile Preview" />
                      <p style={{ marginTop: "38px" }}>Uploading..</p>
                    </>
                  ) : (
                    <>
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile Preview"
                          style={{ width: "93px" }}
                        />
                      ) : (
                        <img src={defaultProfileImg} alt="" />
                      )}
                    </>
                  )}

                  {!imageUploadLoader && (
                    <div className="upload-input-file">
                      <input
                        type="file"
                        className="input-file"
                        accept="image/*"
                        onChange={(e) => updateAccount(e, "profile-image")}
                      />
                      <img src={uploadIcon2} alt="" />
                    </div>
                  )}
                </div>
              </li>

              <li>
                <label>{t("common.display_name")}</label>
                <input
                  type="text"
                  name="displayName"
                  value={accountDetails?.name}
                  onChange={(e) =>
                    setAccountDetails({
                      ...accountDetails,
                      name: e.target.value,
                    })
                  }
                  className="control-form"
                  placeholder={t("common.display_name")}
                />
                {errors?.name && (
                  <span style={{ color: "red" }}>{errors.name}</span>
                )}
              </li>

              <li>
                <label>{t("order.email")}</label>
                <input
                  name="email"
                  disabled
                  style={{ cursor: "not-allowed" }}
                  value={accountDetails?.email}
                  type="email"
                  className="control-form"
                  placeholder={t("order.email")}
                />
                {errors?.email && (
                  <span style={{ color: "red" }}>{errors.email}</span>
                )}
              </li>

              <li>
                <div className="modal-btn-group">
                  {accountLoading ? (
                    <button
                      type="button"
                      className="btn btn--primary btn--loading"
                      style={{
                        width: "115px",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: "0.5",
                        cursor: "not-allowed",
                      }}
                    >
                      <CircularProgress size="25px" style={{ color: "#fff" }} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={() => updateAccount("", "edit")}
                    >
                      <img src={uploadIcon} alt="" /> {t("common.save")}
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => setAccountModal(false)}
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default Header;
