// src/layouts/Sidebar.jsx
import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

// import images
import Logo from "../assets/images/logo_white.svg";
import lineIcon from "../assets/images/menu-line.svg";
import SidebarIconDashboard from "../assets/images/dashboard-icon1.svg";
import SidebarIconUsers from "../assets/images/dashboard-icon4.svg";
import SidebarIconPlans from "../assets/images/dashboard-icon5.svg";
import SidebarIconSettings from "../assets/images/dashboard-icon6.svg";
import SidebarIconDocs from "../assets/images/dashboard-icon7.svg";

/* sidebarItems (same as yours) */
const sidebarItems = [
  { path: "/dashboard", icon: SidebarIconDashboard, labelKey: "sidebar.dashboard" },
  { path: "/users", icon: SidebarIconUsers, labelKey: "sidebar.users" },
  { path: "/dashboard-images", icon: SidebarIconPlans, labelKey: "sidebar.dashboard_images" },
  { path: "/monthly-plans", icon: SidebarIconPlans, labelKey: "sidebar.monthly_plans" },
  { path: "/salary-slips", icon: SidebarIconPlans, labelKey: "sidebar.salary_slips" },
  { path: "/news", icon: SidebarIconDocs, labelKey: "sidebar.news" },
  { path: "/documents", icon: SidebarIconDocs, labelKey: "sidebar.documents" },
  { path: "/messages", icon: SidebarIconDocs, labelKey: "sidebar.messages" },
  { path: "/groups", icon: SidebarIconDocs, labelKey: "groups.plural" },
  { path: "/positions", icon: SidebarIconDocs, labelKey: "positions.plural" },
  { path: "/floors", icon: SidebarIconDocs, labelKey: "floors.plural" },
  { path: "/settings", icon: SidebarIconSettings, labelKey: "sidebar.settings" },
];

const MOBILE_BREAKPOINT = 768; // match your CSS breakpoint

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });

  const { t } = useTranslation();
  const location = useLocation();

  // helper: is viewport currently "mobile"
  const isMobileView = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
  }, []);

  // Toggle for desktop/tablet collapsed state (persist)
  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const newValue = !prev;
      localStorage.setItem("sidebarCollapsed", newValue);
      return newValue;
    });
  }, []);

  // Close mobile sidebar (remove body class)
  const closeMobileSidebar = useCallback(() => {
    document.body.classList.remove("sidebar-open");
  }, []);

  // Handle the global toggle event (fired by header)
  useEffect(() => {
    const handler = () => {
      if (isMobileView()) {
        // mobile -> toggle full-width menu via body class
        document.body.classList.toggle("sidebar-open");
      } else {
        // desktop/tablet -> toggle collapsed state
        toggleCollapsed();
      }
    };

    window.addEventListener("toggleSidebar", handler);
    return () => window.removeEventListener("toggleSidebar", handler);
  }, [isMobileView, toggleCollapsed]);

  // Close mobile menu automatically on route change
  useEffect(() => {
    if (isMobileView()) {
      closeMobileSidebar();
    }
    // we only want this to run on location changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <div className={`sidebar ${collapsed && !isMobileView() ? "collapsed" : ""}`}>
      <div className={`sidebar-header ${collapsed && !isMobileView() ? "collapsed" : ""}`}>
        <img src={Logo} alt="Logo" className="sidebar-logo" />

        {/* mobile close button (visible via CSS on small screens) */}
        <button
          className="mobile-menu-btn close-btn"
          aria-label="Close menu"
          onClick={closeMobileSidebar}
        >
          ✕
        </button>
      </div>

      {/* collapse-strip removed — hamburger controls collapsing/opening */}

      <ul className="sidebar-menu" role="navigation" aria-label={t("sidebar.navigation") || "Navigation"}>
        {sidebarItems.map(({ path, icon, labelKey }) => (
          <li key={path}>
            <Link
              to={path}
              className={isActive(path) ? "active" : ""}
              onClick={() => {
                // always close mobile menu on select
                if (isMobileView()) closeMobileSidebar();
              }}
            >
              <img src={icon} alt={t(labelKey)} />
              {/* Always show label in mobile view */}
              {(!collapsed || isMobileView()) && <span>{t(labelKey)}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
