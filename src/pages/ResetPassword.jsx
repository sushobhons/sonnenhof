import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Logo from "../assets/images/logo.svg";
import SuccessIcon from "../assets/images/success-icon.svg";
import CircularProgress from "@mui/material/CircularProgress";
import useQuery from "../commonFunction/useQuery";

const ResetPassword = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const query = useQuery();
  const params = Object.fromEntries(query.entries());
  // console.log(params)
  // console.log(params?.token)
  // console.log(params?.email)
  const [showPopup, setShowPopup] = useState(false);
  const [resetData, setResetData] = useState({
    // emailAddress: "",
    password: "",
    cPassword: "",
  });
  const [errors, setErrors] = useState({
    // emailAddress: "",
    password: "",
    cPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResetData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const passwordValidate = () => {
    let isValid = true;
    let newErrors = { ...errors };
    // const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    // if (!resetData.emailAddress.trim()) {
    //   newErrors.emailAddress = "Email address is required";
    //   isValid = false;
    // } else if (!emailRegex.test(resetData.emailAddress)) {
    //   newErrors.emailAddress = "Invalid email format";
    //   isValid = false;
    // }

    if (!resetData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (resetData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!resetData.cPassword) {
      newErrors.cPassword = "Confirm password is required";
      isValid = false;
    } else if (resetData.cPassword !== resetData.password) {
      newErrors.cPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handlePasswordReset = async () => {
    if (!passwordValidate()) return;

    try {
      setPasswordLoading(true);

      const formData = new FormData();
      formData.append("email", params?.email);
      formData.append("token",params?.token);
      formData.append("password", resetData.password);
      formData.append("password_confirmation", resetData.cPassword);


      const apiRes = await fetch(`${API_BASE_URL}/customers/reset-password`, {
        method: "POST",
        body: formData,
      });

      const responseData = await apiRes.json();

      if (responseData.status) {
        toast.success(responseData.message, { autoClose: 2000 });
        setResetData({
          emailAddress: "",
          password: "",
          cPassword: "",
        });
        setErrors({
          emailAddress: "",
          password: "",
          cPassword: "",
        });
        setShowPopup(true);
      } else {
        toast.error(responseData.message || "Something went wrong", {
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="fullWidth">
      <div className="loginMain">
        <div className="logoSec">
          <img src={Logo} alt="Logo" />
        </div>

        <div className="loginForm">
          <h2>Reset password</h2>
          <p>Reset your password if you forgot them</p>
          <ul>
            <li>
              <label>Email Address*</label>
              <input
                type="email"
                name="emailAddress"
                onChange={handleChange}
                value={params?.email}
                disabled
                style={{cursor:'not-allowed'}}
                placeholder="Enter your email"
              />
              {/* {errors.emailAddress && (
                <span style={{ color: "red" }}>{errors.emailAddress}</span>
              )} */}
            </li>
            <li>
              <label>Enter new password*</label>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                value={resetData.password}
                placeholder="Enter your new password"
              />
              {errors.password && (
                <span style={{ color: "red" }}>{errors.password}</span>
              )}
            </li>
            <li>
              <label>Confirm password*</label>
              <input
                type="password"
                name="cPassword"
                onChange={handleChange}
                value={resetData.cPassword}
                placeholder="Confirm your password"
              />
              {errors.cPassword && (
                <span style={{ color: "red" }}>{errors.cPassword}</span>
              )}
            </li>
            <li className="resetPassword">
              <button
                onClick={() => handlePasswordReset()}
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <CircularProgress size="25px" style={{ color: "#fff" }} />
                ) : (
                  "Reset"
                )}
              </button>
              {/* <Link to="/">Back to login</Link> */}
            </li>
          </ul>
        </div>
      </div>

      {showPopup && (
        <div className="popupOverlay">
          <div className="popupContent">
            <img src={SuccessIcon} alt="Success" />
            <h2>Reset Password!</h2>
            <p>
              Your password has been successfully updated! You can now log in to
              your account using your new credentials.
            </p>
            <Link to="/">Log in Now</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
