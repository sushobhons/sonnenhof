import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../auth/useAuth";
import API from "../api/axios";
import { useTranslation } from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";
import { useTheme } from "../layouts/ThemeProvider";

//import Logo from "../assets/images/logo.svg";
import EyeOpen from "../assets/images/eyeOpen.svg";
import EyeClose from "../assets/images/eyeClose.svg";
import { DEFAULT_FULL_LOGO, IMAGE_URL } from "../utils/apiUrl";
import { InfiniteLoader } from "@/assets/images";
import { getDomainRole } from "../utils/getDomainRole";

const Login = () => {
  const { username: subDomain } = getDomainRole();
  const { resellerId } = useParams();
  const [logo, setLogo] = useState(DEFAULT_FULL_LOGO);
  const [pageLoader, setPageLoader] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setPageLoader(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await API.post("/login", {
        username,
        password,
      });

      const user = response.data.user;
      const token = response.data.token;
      login(user, token);

      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || t("common.create.error"), {
        theme: "dark",
        autoClose: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {pageLoader ? (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
          }}
        >
          <img src={InfiniteLoader} alt="backdrop-loader" />
        </div>
      ) : (
        <div className="admin-login">
          <div className="admin-login__logo">
            <img src={logo} alt="Logo" style={{ maxWidth: 145 }} />
          </div>

          <div className="admin-login__box">
            <h2>{t("auth.welcome_back")}</h2>
            <p>{t("auth.please_sign_in")}</p>

            <form onSubmit={handleSubmit} className="admin-login__form">
              <div className="form-container">
                {/* Username */}
                <div className="form-group">
                  <label htmlFor="username">{t("auth.username")}*</label>
                  <input
                    id="username"
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                {/* Password */}
                <div className="form-group password-group">
                  <label htmlFor="password">{t("auth.password")}*</label>
                  <div className="input-wrapper">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    {password && (
                      <img
                        src={showPassword ? EyeClose : EyeOpen}
                        alt="toggle password visibility"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="form-group">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <CircularProgress
                        size={20}
                        style={{ color: "#0f4166" }}
                      />
                    ) : (
                      t("auth.login")
                    )}
                  </button>
                </div>

                {/* Forgot Password */}
                <div className="form-group admin-login__forgot">
                  <a>{t("auth.forgot_password")}</a>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
