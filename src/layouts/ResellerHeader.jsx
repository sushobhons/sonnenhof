import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";
import { useTranslation } from "react-i18next";
import { loadLanguage } from "../utils/loadLanguage";
import i18n from "../i18n";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import usFlag from "../assets/images/united-states-flags.png";
import frenchFlag from "../assets/images/french-flag.png";

// import images
import UserImg from "../assets/images/user-img.svg";
import BellImg from "../assets/images/bell-icon.svg";
import CountryImg from "../assets/images/country-img.svg";
import modalCrossIcon from "../assets/images/modal-cross-icon.png";
import loaderImg from "../assets/images/loader.gif";
import defaultProfileImg from "../assets/images/default-profile-img.png";
import uploadIcon from "../assets/images/upload-icon2.png";
import uploadIcon2 from "../assets/images/upload-icon3.png";
import { displayName } from "react-quill";
import { toast } from "react-toastify";
import API from "../api/axios";

const ResellerHeader = ({ pageTitle }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDropdownOpen2, setIsDropdownOpen2] = useState(false);
  const [selectedLang, setSelectedLang] = useState(i18n.language);
  const [selectedFlag, setSelectedFlag] = useState(
    i18n.language === "fr" ? frenchFlag : usFlag
  );

  const [imageUploadLoader, setImageUploadLoader] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);

  const { user, logout, updateUser } = useAuth();
  const profileImage = user?.profile_pic || null;
  const headerColor = user?.reseller_background_color || "#000000";

  const navigate = useNavigate();
  const { t } = useTranslation();
  const dropdownRef1 = useRef(null);
  const dropdownRef2 = useRef(null);
  const [accountModal, setAccountModal] = useState(false);
  const [accountDetails, setAccountDetails] = useState({
    displayName: user?.name,
    email: user?.email,
  });

  const [accountDetailsErrors, setAccountDetailsErrors] = useState({
    displayName: "",
    email: "",
  });

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  const toggleDropdown2 = () => {
    setIsDropdownOpen2((prev) => !prev);
  };

  const handleLanguageChange = async (lang) => {
    await loadLanguage(lang);
    setSelectedLang(lang);
    if (lang === "fr") {
      setSelectedFlag(frenchFlag);
    } else {
      setSelectedFlag(usFlag);
    }
    setIsDropdownOpen2(false);
  };

  const getLanguageName = (code) => {
    switch (code) {
      case "en":
        return "English";
      case "fr":
        return "Français";
      default:
        return code;
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileType = file.type.split("/")[0];
      if (fileType === "image") {
        const imageUrl = URL.createObjectURL(file);
        try {
          setImageUploadLoader(true);
          const formData = new FormData();
          formData.append("profile_pic", event.target.files[0]);
          const apiRes = await API.post(`/reseller/profile-picture`, formData, {
            headers: {
              "Content-Type": "multipart/formdata",
            },
          });

          if (apiRes.data.status) {
            toast.success(apiRes.data.message, {
              theme: "dark",
              autoClose: 2000,
            });
            const newProfilePic = apiRes.data.data?.profile_pic;
            if (newProfilePic) {
              updateUser({ profile_pic: newProfilePic });
            }
          }
        } catch (error) {
          toast.error(error?.response?.data?.message, {
            theme: "dark",
            autoClose: 2000,
          });
        } finally {
          setImageUploadLoader(false);
        }
      } else {
        toast.error("Please upload a valid image file", { autoClose: 2000 });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccountDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateAccountSettings = () => {
    let isValid = true;
    let newErrors = { ...accountDetailsErrors };
    if (!accountDetails.displayName.trim()) {
      newErrors.displayName = "Name is required";
      isValid = false;
    } else {
      newErrors.displayName = "";
    }
    setAccountDetailsErrors(newErrors);
    return isValid;
  };

  const updateAccount = async () => {
    try {
      if (!validateAccountSettings()) {
        return;
      }
      setAccountLoading(true);
      const formData = new FormData();
      const payloadData = {
        name: accountDetails?.displayName,
        email: accountDetails?.email,
      };

      Object.entries(payloadData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const apiRes = await API.put(`/reseller/profile`, formData);
      if (apiRes.data.success) {
        const updatedUserObj = {
          ...user,
          name: accountDetails?.displayName,
          email: accountDetails?.email,
        };
        localStorage.setItem(
          "vehicleTune_user",
          JSON.stringify(updatedUserObj)
        );
        toast.success(apiRes.data.message, {
          theme: "dark",
          autoClose: 2000,
        });
        setAccountModal(false);
        const newName = accountDetails?.displayName;
        if (newName) {
          updateUser({ name: newName });
        }
      } else {
        console.log(apiRes.data.message);
        toast.error(apiRes.data.message, {
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(t("common.error"));
    } finally {
      setAccountModal(false);
      setAccountLoading(false);
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
    <div className="header" style={{ backgroundColor: headerColor }}>
      <h2>{t(pageTitle)}</h2>

      <div className="headerRight">
        {/* <div className="bellDiv">
          <img src={BellImg} alt="" />
        </div> */}
        <div className="userDropdown" ref={dropdownRef1}>
          <div className="userDetails" onClick={toggleDropdown}>
            <img
              src={profileImage ? profileImage : defaultProfileImg}
              alt="profile-image"
              style={{ width: "34px", height: "32px", borderRadius: "100%" }}
            />{" "}
            {user?.name ? `${user.name}` : "Reseller"}
          </div>

          <ul className={isDropdownOpen ? "open" : ""}>
            <li>
              <Link to="/reseller/dashboard">{t("dashboard.title")}</Link>
            </li>
            <li>
              <Link
                onClick={() => {
                  toggleDropdown();
                  setAccountModal(true);
                }}
              >
                {t("account.my_account")}
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="logoutBtn">
                {t("dashboard.logout")}
              </button>
            </li>
          </ul>
        </div>
        <div className="userDropdown" ref={dropdownRef2}>
          <div className="userDetails" onClick={toggleDropdown2}>
            <img src={selectedFlag} alt="" /> {getLanguageName(selectedLang)}
          </div>

          <ul className={isDropdownOpen2 ? "open" : ""}>
            <li>
              <button
                onClick={() => handleLanguageChange("en")}
                className="logoutBtn"
              >
                English
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLanguageChange("fr")}
                className="logoutBtn"
              >
                Français
              </button>
            </li>
          </ul>
        </div>
      </div>
      <Modal
        open={accountModal}
        onClose={() => setAccountModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="modal-box my-account-modal-box">
          <div className="modal-header">
            <button
              className="close-btn"
              onClick={() => setAccountModal(false)}
            >
              <img src={modalCrossIcon} alt="" />
            </button>
            <h3 className="modal-title">
              {t("password.personal_information")}
            </h3>
          </div>
          <div className="modal-body">
            <ul className="signup-form-list">
              <li>
                <div className="upload-profile-box">
                  {/* {profileImage ? <img src={profileImg} alt="" /> */}
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
                        <img src={defaultProfileImg} />
                      )}
                    </>
                  )}
                  {!imageUploadLoader && (
                    <div className="upload-input-file">
                      <input
                        type="file"
                        className="input-file"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <img src={uploadIcon2} alt="" />
                    </div>
                  )}
                </div>
              </li>
              <li>
                <label>{t("common.display_name")} </label>
                <input
                  type="text"
                  name="displayName"
                  value={accountDetails?.displayName}
                  onChange={(e) => handleChange(e)}
                  className="control-form"
                  placeholder={t("common.display_name")}
                />
                {accountDetailsErrors?.displayName && (
                  <span style={{ color: "red" }}>
                    {accountDetailsErrors.displayName}
                  </span>
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
                {accountDetailsErrors?.email && (
                  <span style={{ color: "red" }}>
                    {accountDetailsErrors.email}
                  </span>
                )}
              </li>
              <li>
                <div className="modal-btn-group">
                  {accountLoading ? (
                    <button
                      type="button"
                      className="black-btn"
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
                      className="black-btn"
                      onClick={() => updateAccount()}
                    >
                      <img src={uploadIcon} alt="" /> {t("common.save")}
                    </button>
                  )}

                  <button
                    type="button"
                    className="white-btn"
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

export default ResellerHeader;
