import { Link } from "react-router-dom";
import Logo from "../assets/images/logo.svg";

const ForgotPassword = () => {
  return (
    <div className="fullWidth">
      <div className="loginMain">
        <div className="logoSec">
          <img src={Logo} alt="" />
        </div>

        <div className="loginForm">
          <h2>Forgot your password</h2>
          <p>
            All good! Enter your register email address and we’ll send you a
            link to reset your password.
          </p>
          <ul>
            <li>
              <label>Enter email address*</label>
              <input type="email" placeholder="Enter register email" />
            </li>
            <li className="resetPassword">
              <button>Request reset link</button>
              <Link to="/">Back to login</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
