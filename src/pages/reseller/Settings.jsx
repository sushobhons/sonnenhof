import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

import ResellerSidebar from "../../layouts/ResellerSidebar";
import ResellerHeader from "../../layouts/ResellerHeader";

import CrossIcon from "../../assets/images/cross-icon.svg";
import SuccessIcon from "../../assets/images/success-icon.svg";

import EyeOpen from "../../assets/images/eyeOpen.svg";
import EyeClose from "../../assets/images/eyeClose.svg";
import useAuth from "../../auth/useAuth";
import { useTranslation } from "react-i18next";
import API from "../../api/axios";
import { toast } from "react-toastify";
import { IMAGE_URL } from "../../utils/apiUrl";

const Settings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout, updateUser } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [showPopup2, setShowPopup2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatingAccount, setUpdatingAccount] = useState(false);
  const [countries, setCountries] = useState([]);
  const [accountSettings, setAccountSettings] = useState({
    displayName: "",
    username: "",
    // postalCode: "",
    idPaypal: "",
    codeSecretPaypal: "",
    prefixUrlPanel: "",
    emailAddress: "",
    countryCode: "",
    freshLineLabel: "",
    additonalFeeAmount: "",
    stripePublishableKey: "",
    stripeSecretKey: "",
  });

  const [error, setError] = useState({
    displayName: "",
    username: "",
    // postalCode: "",
    idPaypal: "",
    codeSecretPaypal: "",
    prefixUrlPanel: "",
    emailAddress: "",
    countryCode: "",
    freshLineLabel: "",
    additonalFeeAmount: "",
    stripePublishableKey: "",
    stripeSecretKey: "",
  });

  const [personalizeData, setPersonalizeData] = useState({
    logo: "",
    logoName: "",
    bgColor: "#0F0F0F",
    profileImage: "",
  });

  const [password, setPassword] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [errors, setErrors] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const openPopup = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPassword({
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    });

    setErrors({
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    });

    setShowPassword({
      current: false,
      new: false,
      confirm: false,
    });

    // setShowPopup2(true);
    setShowPopup(false);
  };

  const validate = () => {
    let isValid = true;
    let newErrors = {
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    };

    const strongPasswordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!password.current_password) {
      newErrors.current_password = "Current password is required";
      isValid = false;
    }

    if (!password.new_password) {
      newErrors.new_password = "New password is required";
      isValid = false;
    } else if (!strongPasswordRegex.test(password.new_password)) {
      newErrors.new_password =
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.";
      isValid = false;
    }

    if (!password.new_password_confirmation) {
      newErrors.new_password_confirmation = "Please confirm your new password";
      isValid = false;
    } else if (password.new_password !== password.new_password_confirmation) {
      newErrors.new_password_confirmation = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const updatePassword = async () => {
    try {
      setLoading(true);
      if (!validate()) {
        return;
      }

      const formData = new FormData();
      let payloadData = {
        current_password: password.current_password,
        new_password: password.new_password,
        new_password_confirmation: password.new_password_confirmation,
      };

      Object.entries(payloadData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const apiRes = await API.post(`/change-password`, formData);

      if (apiRes.success) {
        toast.success(
          apiRes?.data?.message || "Password updated successfully!"
        );
        closePopup();
        handleLogout();
      } else {
        toast.error(apiRes?.data?.message || "Failed to update password", {
          theme: "dark",
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Something went wrong. Try again.",
        {
          theme: "dark",
          autoClose: 2000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const fileName = (name) => {
    let file = name.split("/").pop();
    return file;
  };

  const fetchCountries = async () => {
    try {
      const apiRes = await API.get(`/countries`);
      if (apiRes.data.length > 0) {
        setCountries(apiRes.data);
      } else {
        setCountries([]);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Something went wrong. Try again.",
        {
          theme: "dark",
          autoClose: 2000,
        }
      );
    }
  };

  const fetchAccountDetails = async () => {
    try {
      const apiRes = await API.get(`/reseller/profile`);
      if (apiRes.data.success) {
        setAccountSettings({
          displayName: apiRes.data.data.user.name,
          username: apiRes.data.data.user.username,
          postalCode: apiRes.data.data.postal_code,
          idPaypal: apiRes.data.data.paypal_id,
          codeSecretPaypal: apiRes.data.data.paypal_code,
          prefixUrlPanel: apiRes.data.data.prefix_url_panel,
          emailAddress: apiRes.data.data.user.email,
          countryCode: apiRes.data.data.country_code,
          freshLineLabel: apiRes.data.data.fresh_line_label,
          additonalFeeAmount: apiRes.data.data.additional_fee,
          stripePublishableKey: apiRes.data.data.stripe_publishable_key,
          stripeSecretKey: apiRes.data.data.stripe_secret_key,
        });

        setPersonalizeData({
          logo: IMAGE_URL + apiRes.data.data.logo,
          logoName: fileName(IMAGE_URL + apiRes.data.data.logo),
          bgColor: apiRes.data.data.admin_panel_color,
          profileImage: apiRes.data.data.profile_pic,
        });
      } else {
        toast.error(apiRes?.data?.message, {
          theme: "dark",
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Something went wrong. Try again.",
        {
          theme: "dark",
          autoClose: 2000,
        }
      );
    }
  };

  const accountvalidate = () => {
    const newErrors = {};

    if (!accountSettings?.displayName?.trim())
      newErrors.displayName = "Required";
    if (!accountSettings?.username?.trim()) newErrors.username = "Required";
    // if (!accountSettings?.postalCode?.trim())
    //   newErrors.postalCode = "Required";
    if (!accountSettings?.idPaypal?.trim()) newErrors.idPaypal = "Required";
    if (!accountSettings?.codeSecretPaypal?.trim())
      newErrors.codeSecretPaypal = "Required";
    // if (!accountSettings?.prefixUrlPanel?.trim())
    //   newErrors.prefixUrlPanel = "Required";

    if (
      !accountSettings?.emailAddress?.trim() ||
      !/\S+@\S+\.\S+/.test(accountSettings.emailAddress)
    ) {
      newErrors.emailAddress = "Valid email required";
    }

    if (!accountSettings?.countryCode?.trim())
      newErrors.countryCode = "Required";
    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccountSettings((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    try {
      setUpdatingAccount(true);
      if (!accountvalidate()) {
        return;
      }

      const formData = new FormData();
      let payloadData = {
        name: accountSettings?.displayName,
        username: accountSettings?.username,
        // password: accountSettings?.password,
        // postal_code: accountSettings?.postalCode,
        paypal_id: accountSettings?.idPaypal,
        paypal_code: accountSettings?.codeSecretPaypal,
        //prefix_url_panel: accountSettings?.prefixUrlPanel,
        email: accountSettings?.emailAddress,
        country_code: accountSettings?.countryCode,
        fresh_line_label: accountSettings?.freshLineLabel,
        additional_fee: accountSettings?.additonalFeeAmount,
        stripe_publishable_key: accountSettings?.stripePublishableKey,
        stripe_secret_key: accountSettings?.stripeSecretKey,
      };

      Object.entries(payloadData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const apiRes = await API.put(`/reseller/profile`, formData);

      if (apiRes.data.success) {
        toast.success(apiRes?.data?.message, {
          theme: "dark",
          autoClose: 2000,
        });
        fetchAccountDetails();
        const newName = accountSettings?.displayName;
        if (newName) {
          updateUser({ name: newName });
        }
      } else {
        toast.error(apiRes?.data?.message, {
          theme: "dark",
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingAccount(false);
    }
  };

  const handleLogout = () => {
    logout();
    if (user?.role === "reseller" && user?.reseller_uuid) {
      navigate(`/login/${user.reseller_uuid}`);
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchAccountDetails();
  }, []);

  return (
    <div className="fullWidth">
      <div className="main">
        <ResellerSidebar />
        <div className="container">
          <ResellerHeader pageTitle={t("sidebar.settings")} />
          <div className="mainInnerDiv">
            <div className="resellerNav settingNav">
              <ul>
                <li>
                  <Link to="/admin/settings" className="active">
                    Account settings
                  </Link>
                </li>
                <li>
                  <Link to="/admin/personalize-panel">Personalize panel</Link>
                </li>
              </ul>
            </div>

            <div className="resellerForm holderContainer alertForm">
              <ul>
                <li>
                  <label>Display Name</label>
                  <input
                    type="text"
                    name="displayName"
                    placeholder="name"
                    onChange={handleChange}
                    value={accountSettings?.displayName}
                  />
                </li>
                <li>
                  <label>Username</label>
                  <input
                    type="text"
                    disabled
                    style={{ cursor: "not-allowed" }}
                    name="username"
                    onChange={handleChange}
                    value={accountSettings?.username}
                  />
                </li>
                <li>
                  <label>Id PayPal</label>
                  <input
                    type="text"
                    name="idPaypal"
                    placeholder="Id PayPal"
                    onChange={handleChange}
                    value={accountSettings?.idPaypal}
                  />
                </li>
                <li>
                  <label>Code secret PayPal</label>
                  <input
                    type="text"
                    name="codeSecretPaypal"
                    placeholder="Code secret PayPal"
                    onChange={handleChange}
                    value={accountSettings?.codeSecretPaypal}
                  />
                </li>
                <li>
                  <label>Stripe Publishable Key</label>
                  <input
                    type="text"
                    name="stripePublishableKey"
                    placeholder="Publish Key"
                    onChange={handleChange}
                    value={accountSettings?.stripePublishableKey}
                  />
                </li>
                <li>
                  <label>Stripe Secret Key</label>
                  <input
                    type="text"
                    name="stripeSecretKey"
                    placeholder="Stripe Secret Key"
                    onChange={handleChange}
                    value={accountSettings?.stripeSecretKey}
                  />
                </li>
                <li>
                  <label>Email address</label>
                  <input
                    type="email"
                    disabled
                    style={{ cursor: "not-allowed" }}
                    name="emailAddress"
                    placeholder="Email address"
                    value={accountSettings?.emailAddress}
                  />
                </li>
                <li>
                  <label>Country code</label>
                  <select
                    name="countryCode"
                    value={accountSettings?.countryCode}
                    onChange={handleChange}
                  >
                    {countries?.length > 0 ? (
                      countries?.map((item, index) => {
                        return (
                          <option key={index} value={item.code}>
                            {item?.code}
                          </option>
                        );
                      })
                    ) : (
                      <option disabled hidden>
                        No countries found.
                      </option>
                    )}
                  </select>
                </li>
                <li>
                  <label>Fresh line label</label>
                  <input
                    type="text"
                    name="freshLineLabel"
                    placeholder="Fresh line label"
                    onChange={handleChange}
                    value={accountSettings?.freshLineLabel}
                  />
                </li>
                <li>
                  <label>Additional Fee Amount (%)</label>
                  <input
                    type="text"
                    name="additonalFeeAmount"
                    placeholder="Additional Fee Amount (%)"
                    onChange={handleChange}
                    value={accountSettings?.additonalFeeAmount}
                  />
                </li>
              </ul>
            </div>

            <div className="messagesEditor">
              <div className="dashTop editorSave">
                <div className="enablePop"></div>
                <div className="resellerBtns">
                  <button className="saveBtn changeBtn" onClick={openPopup}>
                    Change password
                  </button>
                  <button
                    className="saveBtn"
                    disabled={updatingAccount}
                    style={{
                      cursor: updatingAccount ? "not-allowed" : "cursor",
                      opacity: updatingAccount ? "0.5" : "1",
                    }}
                    onClick={() => handleSubmit()}
                  >
                    {updatingAccount ? (
                      <CircularProgress size={20} style={{ color: "white" }} />
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showPopup && (
          <div className="popupOverlay">
            <div className="popupContent2 popPackage">
              <div className="popupHeader">
                <h2>Change password</h2>
                <img
                  src={CrossIcon}
                  alt=""
                  className="closeBtn"
                  onClick={closePopup}
                />
              </div>

              <div className="resellerForm addNewPopup">
                <ul>
                  {/* Current Password */}
                  <li>
                    <label>Current password</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword.current ? "text" : "password"}
                        placeholder="Enter here"
                        value={password.current_password}
                        onChange={(e) =>
                          setPassword({
                            ...password,
                            current_password: e.target.value,
                          })
                        }
                      />
                      <img
                        src={showPassword.current ? EyeOpen : EyeClose}
                        alt="toggle"
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          cursor: "pointer",
                          width: "24px",
                          height: "24px",
                        }}
                        onClick={() =>
                          setShowPassword((prev) => ({
                            ...prev,
                            current: !prev.current,
                          }))
                        }
                      />
                    </div>
                    {errors.current_password && (
                      <span style={{ color: "red" }}>
                        {errors.current_password}
                      </span>
                    )}
                  </li>

                  {/* New Password */}
                  <li>
                    <label>New Password</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword.new ? "text" : "password"}
                        placeholder="Enter here"
                        value={password.new_password}
                        onChange={(e) =>
                          setPassword({
                            ...password,
                            new_password: e.target.value,
                          })
                        }
                      />
                      <img
                        src={showPassword.new ? EyeOpen : EyeClose}
                        alt="toggle"
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          cursor: "pointer",
                          width: "24px",
                          height: "24px",
                        }}
                        onClick={() =>
                          setShowPassword((prev) => ({
                            ...prev,
                            new: !prev.new,
                          }))
                        }
                      />
                    </div>
                    {errors.new_password && (
                      <span style={{ color: "red" }}>
                        {errors.new_password}
                      </span>
                    )}
                  </li>

                  {/* Confirm New Password */}
                  <li>
                    <label>Confirm New Password</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        placeholder="Enter password"
                        value={password.new_password_confirmation}
                        onChange={(e) =>
                          setPassword({
                            ...password,
                            new_password_confirmation: e.target.value,
                          })
                        }
                      />
                      <img
                        src={showPassword.confirm ? EyeOpen : EyeClose}
                        alt="toggle"
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          cursor: "pointer",
                          width: "24px",
                          height: "24px",
                        }}
                        onClick={() =>
                          setShowPassword((prev) => ({
                            ...prev,
                            confirm: !prev.confirm,
                          }))
                        }
                      />
                    </div>
                    {errors.new_password_confirmation && (
                      <span style={{ color: "red" }}>
                        {errors.new_password_confirmation}
                      </span>
                    )}
                  </li>
                </ul>

                {/* Buttons */}
                <div className="popBtns">
                  {loading ? (
                    <button
                      className="packageBtn"
                      disabled
                      style={{
                        cursor: "not-allowed",
                        width: "96px",
                        justifyContent: "center",
                        opacity: "0.5",
                      }}
                    >
                      <CircularProgress size={20} style={{ color: "white" }} />
                    </button>
                  ) : (
                    <button className="packageBtn" onClick={updatePassword}>
                      Submit
                    </button>
                  )}

                  <button className="closeBtn2" onClick={closePopup}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showPopup2 && (
          <div className="popupOverlay">
            <div className="popupContent">
              <img src={SuccessIcon} alt="" />
              <h2>Reset Password!</h2>
              <p>
                Your password has been successfully changed. Please check your
                email for a verification link. Click the link and log in with
                your new credentials.
              </p>
              <Link to="/">Log in Now</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
