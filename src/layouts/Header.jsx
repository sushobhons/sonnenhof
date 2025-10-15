import { useState } from "react";
import { Link } from "react-router-dom";

// import images
import UserImg from "../assets/images/user-img.svg";
import BellImg from "../assets/images/bell-icon.svg";

const Header = ({ pageTitle }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    return (
        <div className="header">
            <h2>{pageTitle}</h2>

            <div className="headerRight">
                
                <div className="bellDiv">
                    <img src={BellImg} alt="" />
                </div>
                <div className="userDropdown">
                    <div className="userDetails" onClick={toggleDropdown}>
                        <img src={UserImg} alt="" /> Super Admin
                    </div>

                    {/* Dropdown Menu */}
                    <ul className={isDropdownOpen ? "open" : ""}>
                        <li>
                            <Link to="">Dashboard</Link>
                        </li>
                        <li>
                            <Link to="">Logout</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Header;
