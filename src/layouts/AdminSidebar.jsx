import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../auth/useAuth";
import { useTranslation } from "react-i18next";

// import images
import { DEFAULT_LOGO } from "../utils/apiUrl";
import PrevIcon from "../assets/images/prev-arrow-icon.svg";
import lineIcon from "../assets/images/menu-line.svg";
import SidebarIcon1 from "../assets/images/dashboard-icon1.svg";
import SidebarIcon3 from "../assets/images/dashboard-icon3.svg";
import SidebarIcon4 from "../assets/images/dashboard-icon4.svg";
import SidebarIcon5 from "../assets/images/dashboard-icon5.svg";
import SidebarIcon14 from "../assets/images/dashboard-icon14.svg";

const sidebarItems = [
  {
    path: "/admin/dashboard",
    icon: SidebarIcon1,
    labelKey: "sidebar.dashboard",
  },
  {
    path: "/admin/companies",
    icon: SidebarIcon3,
    labelKey: "company.plural",
  },
  { path: "/admin/users", icon: SidebarIcon4, labelKey: "sidebar.users" },
  { path: "/admin/api-logs", icon: SidebarIcon5, labelKey: "sidebar.logs" },
  {
    path: "/admin/settings",
    icon: SidebarIcon14,
    labelKey: "sidebar.settings",
  },
];

const AdminDashboardSidebar = () => {
  const [collapsed, setCollapsed] = useState(() => {
    // get initial value from localStorage
    return localStorage.getItem("sidebarCollapsed") === "true";
  });

  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const newValue = !prev;
      localStorage.setItem("sidebarCollapsed", newValue);
      return newValue;
    });
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className={`sidebar-header ${collapsed ? "collapsed" : ""}`}>
        <img src={DEFAULT_LOGO} alt="Logo" />
      </div>
      {/* <div className="collapse-btn" onClick={toggleSidebar}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="5" x2="21" y2="5" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="13" x2="21" y2="13" />
        </svg>
      </div> */}
      <div className="collapse-strip" onClick={toggleSidebar}>
        <div className="collapse-strip-inner">
          <span className="collapse-arrow">{collapsed ? "›" : "‹"}</span>
        </div>
      </div>

      <ul className="sidebar-menu">
        {sidebarItems.map(({ path, icon, labelKey }) => (
          <li key={path}>
            <Link to={path} className={isActive(path) ? "active" : ""}>
              <img src={icon} alt={t(labelKey)} />
              {!collapsed && <span>{t(labelKey)}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboardSidebar;
