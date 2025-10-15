import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AdminResellerNav = ({ id }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="resellerNav">
      <ul>
        <li>
          <Link
            to={`/admin/resellers/${id}`}
            className={
              location.pathname === `/admin/resellers/${id}` ? "active" : ""
            }
          >
            {t("reseller.account_details")}
          </Link>
        </li>
        <li>
          <Link
            to={`/admin/resellers/${id}/customers`}
            className={isActive("customers") ? "active" : ""}
          >
            {t("reseller.customers")}
          </Link>
        </li>
        <li>
          <Link
            to={`/admin/resellers/${id}/orders`}
            className={isActive("orders") ? "active" : ""}
          >
            {t("reseller.orders")}
          </Link>
        </li>
        <li>
          <Link
            to={`/admin/resellers/${id}/services`}
            className={isActive("services") ? "active" : ""}
          >
            {t("reseller.services")}
          </Link>
        </li>
        <li>
          <Link
            to={`/admin/resellers/${id}/token-packages`}
            className={isActive("token-packages") ? "active" : ""}
          >
            {t("reseller.price_list")}
          </Link>
        </li>
        <li>
          <Link
            to={`/admin/resellers/${id}/information`}
            className={isActive("information") ? "active" : ""}
          >
            {t("reseller.information")}
          </Link>
        </li>
        <li>
          <Link
            to={`/admin/resellers/${id}/required-fields`}
            className={isActive("required-fields") ? "active" : ""}
          >
            {t("reseller.required_fields")}
          </Link>
        </li>
        <li>
          <Link
            to={`/admin/resellers/${id}/notes`}
            className={isActive("notes") ? "active" : ""}
          >
            {t("reseller.notes")}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminResellerNav;
