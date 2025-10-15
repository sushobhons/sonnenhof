import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuth from "../auth/useAuth";
import { toast } from "react-toastify";
// import images
import Logo from "../assets/images/logo-white.svg";
import FavLogo from "../assets/images/favicon.svg";
import PrevIcon from "../assets/images/prev-arrow-icon.svg";
import NextIcon from "../assets/images/next-arrow-icon.svg";
import SidebarIcon1 from "../assets/images/dashboard-icon1.svg";
import SidebarIcon4 from "../assets/images/dashboard-icon4.svg";
import SidebarIcon5 from "../assets/images/dashboard-icon5.svg";
import SidebarIcon11 from "../assets/images/dashboard-icon11.svg";
import SidebarIcon14 from "../assets/images/dashboard-icon14.svg";
import SidebarIcon15 from "../assets/images/dashboard-icon15.svg";
import SidebarIcon16 from "../assets/images/dashboard-icon16.svg";
import transferRightArrowIcon from "../assets/images/transfer-right-arrow-icon.svg";
import copyIcon from "../assets/images/copy-icon.svg";

const ResellerSidebar = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const sidebarLogo = user?.reseller_logo || null;
  const sidebarCompany = user?.name || null;
  const sidebarColor = user?.reseller_background_color || "#000000";
  const subDomain = user?.username;
  const embedCode = `https://${subDomain}.file-service-portal.com`;

  const { t } = useTranslation();
  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path) => {
    return window.location.pathname.startsWith(path);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      toast.success("Copied!", {
        theme: "dark",
        autoClose: 2000,
      });
    });
  };

  return (
    <div
      className={`sidebarDiv ${isCollapsed ? "collapsed" : ""}`}
      style={{ backgroundColor: sidebarColor }}
    >
      <div className="sideLogo">
        <img
          src={
            sidebarLogo
              ? isCollapsed
                ? sidebarLogo
                : sidebarLogo
              : isCollapsed
              ? FavLogo
              : Logo
          }
          alt="sidebar-logo"
        />
      </div>
      <div className="collapseDiv" onClick={handleCollapse}>
        <img src={isCollapsed ? NextIcon : PrevIcon} alt="" />
      </div>
      <div className="reseller-sidebar">
        <ul>
          <li>
            <Link
              to="/admin/dashboard"
              className={isActive("/admin/dashboard") ? "active" : ""}
            >
              <img src={SidebarIcon1} alt="" />
              {!isCollapsed && t("sidebar.dashboard")}
            </Link>
          </li>
          <li>
            <Link
              to="/admin/orders"
              className={
                isActive("/admin/orders") ||
                isActive("/admin/reseller-order-infromation")
                  ? "active"
                  : ""
              }
            >
              <img src={SidebarIcon5} alt="" />
              {!isCollapsed && t("sidebar.customer_orders")}
            </Link>
          </li>
          <li>
            <Link
              to="/admin/customers"
              className={isActive("/admin/customers") ? "active" : ""}
            >
              <img src={SidebarIcon4} alt="" />
              {!isCollapsed && t("sidebar.customers")}
            </Link>
          </li>
          <li>
            <Link
              to="/admin/token-packages"
              className={isActive("/admin/token-packages") ? "active" : ""}
            >
              <img src={SidebarIcon11} alt="" />
              {!isCollapsed && t("reseller.price_list")}
            </Link>
          </li>
          <li>
            <Link
              to="/admin/panel-configuration"
              className={isActive("/admin/panel-configuration") ? "active" : ""}
            >
              <img src={SidebarIcon15} alt="" />
              {!isCollapsed && t("sidebar.panel_configuration")}
            </Link>
          </li>
          <li>
            <Link
              to="/admin/pricing-configuration"
              className={
                isActive("/admin/pricing-configuration") ? "active" : ""
              }
            >
              <img src={SidebarIcon16} alt="" />
              {!isCollapsed && t("sidebar.pricing_configuration")}
            </Link>
          </li>
          <li>
            <Link
              to="/admin/settings"
              className={
                isActive("/admin/settings") ||
                isActive("/admin/personalize-panel")
                  ? "active"
                  : ""
              }
            >
              <img src={SidebarIcon14} alt="" />
              {!isCollapsed && t("sidebar.settings")}
            </Link>
          </li>
        </ul>
        <div className="reseller-sidebar-bottom">
          <Link
            className="button"
            to={embedCode}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "white" }}
          >
            <span role="img" aria-label="panel">
              <img src={transferRightArrowIcon} alt="" />
            </span>
            <span className="btn-text">{t("reseller.access_panel")}</span>
          </Link>
          <div className="urlBox">
            <input type="text" readOnly value={embedCode} className="input" />
            <button onClick={handleCopy} className="copyButton">
              <img src={copyIcon} alt="" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResellerSidebar;
