import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/AdminHeader";
import API from "../api/axios";
import useAuth from "../auth/useAuth";
import { CrossIcon } from "@/assets/images";

function Settings() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();

  const [accessList, setAccessList] = useState([]);
  const [formData, setFormData] = useState({
    name: user?.name,
    email: user?.email,
    role_name: "",
  });
  const [formMode, setFormMode] = useState("add");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [selectedAccess, setSelectedAccess] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [updatingAccount, setUpdatingAccount] = useState(false);
  const [userTypeList, setUserTypeList] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (id) => {
    setSelectedAccess((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddPopup = () => {
    setFormMode("add");
    setSelectedRole(null);
    setFormData({ role_name: "" });
    setSelectedAccess([]);
    setShowPopup(true);
  };

  const openEditPopup = (role) => {
    setFormMode("edit");
    setSelectedRole(role);
    setFormData({ role_name: role.role_name });
    setSelectedAccess(
      role.accesses.filter((a) => a.can_access).map((a) => a.id)
    );
    setShowPopup(true);
  };

  const closePopup = () => setShowPopup(false);
  const openPasswordPopup = () => setShowPasswordPopup(true);
  const closePasswordPopup = () => setShowPasswordPopup(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (formMode === "edit" && selectedRole) {
      await updateRole(selectedRole.id, formData);
    } else {
      await addRole(formData);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingPassword(true);
    try {
      const response = await API.post("/admin/change-password", passwordData);
      toast.success(response?.data?.message || t("common.update.success"), {
        theme: "dark",
        autoClose: 2000,
      });
      setPasswordData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
      closePasswordPopup();
    } catch (error) {
      toast.error(error?.response?.data?.message || t("common.update.error"), {
        theme: "dark",
        autoClose: 2000,
      });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleAccountUpdate = async () => {
    setUpdatingAccount(true);
    try {
      const payload = { name: formData.name, email: formData.email };
      const response = await API.post("/admin/update-profile", payload);
      const updatedUser = response?.data?.data;
      updateUser({
        name: updatedUser?.name || formData.name,
        email: updatedUser?.email || formData.email,
      });
      toast.success(response?.data?.message || t("common.update.success"), {
        theme: "dark",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || t("common.update.error"), {
        theme: "dark",
        autoClose: 2000,
      });
    } finally {
      setUpdatingAccount(false);
    }
  };

  const addRole = async () => {
    setIsSubmitting(true);
    try {
      const payload = { ...formData, access_ids: selectedAccess };
      const response = await API.post(`/admin/roles`, payload);
      toast.success(response?.data?.message || t("common.create.success"), {
        theme: "dark",
        autoClose: 2000,
      });
      getRoles();
      closePopup();
    } catch (error) {
      toast.error(error?.response?.data?.message || t("common.create.error"), {
        theme: "dark",
        autoClose: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRole = async (roleId) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        access_ids: selectedAccess,
        role_id: roleId,
      };
      const response = await API.put(`/admin/roles/${roleId}`, payload);
      toast.success(response?.data?.message || t("common.update.success"), {
        theme: "dark",
        autoClose: 2000,
      });
      getRoles();
      closePopup();
    } catch (error) {
      toast.error(error?.response?.data?.message || t("common.update.error"), {
        theme: "dark",
        autoClose: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAccessList = async () => {
    try {
      const { data } = await API.get("/admin/access-list");
      if (data?.success) setAccessList(data.data);
    } catch {
      setAccessList([]);
    }
  };

  const getRoles = async () => {
    try {
      const { data } = await API.get("/admin/roles");
      setUserTypeList(data?.data || []);
    } catch {
      setUserTypeList([]);
    }
  };

  useEffect(() => {
    getAccessList();
    getRoles();
  }, []);

  return (
    <div className="main">
      <Sidebar />
      <Header pageTitle={t("sidebar.settings")} />
      <div className="container">
        <div className="dashboard-container">
          {/* <div className="table-container">
            <div className="table-header">
              <h3 className="table-title">{t("users.access_rights")}</h3>
              <div className="table-actions">
                <button className="btn btn-primary" onClick={openAddPopup}>
                  {t("users.add_rights")}
                </button>
              </div>
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t("users.user_type")}</th>
                    <th>{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="2" className="loading-cell">
                        {t("common.loading")}...
                      </td>
                    </tr>
                  ) : userTypeList.length > 0 ? (
                    userTypeList.map((userType) => (
                      <tr key={userType.id}>
                        <td>{userType.role_name}</td>
                        <td>
                          <button
                            className="btn-action btn-view"
                            onClick={() => openEditPopup(userType)}
                          >
                            {t("common.edit")}
                          </button>
                          <button className="btn-action btn-trash">
                            {t("common.delete")}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2">{t("common.result.no_record")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div> */}

          <div className="card">
            <div className="card-body">
              <div className="form-container">
                <ul className="form-row">
                  <li>
                    <label>{t("users.name")}</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder={t("common.enter_placeholder")}
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </li>
                  <li>
                    <label>{t("users.email")}</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder={t("common.enter_placeholder")}
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </li>
                </ul>
              </div>
              <div className="btn-group">
                <button
                  className="btn btn-primary"
                  disabled={updatingAccount}
                  onClick={handleAccountUpdate}
                >
                  {updatingAccount ? (
                    <CircularProgress size={20} />
                  ) : (
                    t("common.save")
                  )}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={openPasswordPopup}
                >
                  {t("password.change_password")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-container modal-md">
            <div className="popup-header">
              <h2>
                {formMode === "edit"
                  ? t("users.edit_rights")
                  : t("users.add_rights")}
              </h2>
              <img
                src={CrossIcon}
                alt=""
                className="popup-close"
                onClick={closePopup}
              />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="popup-body">
                <div className="form-container">
                  <ul className="form-row">
                    <li>
                      <label>{t("users.user_type")}</label>
                      <input
                        type="text"
                        name="role_name"
                        className="form-control"
                        placeholder={t("common.enter_placeholder")}
                        value={formData.role_name}
                        onChange={handleChange}
                        readOnly={formMode === "edit"}
                      />
                    </li>
                    <li>
                      <label>{t("users.access_rights")}</label>
                      <div className="checkbox-group">
                        {accessList.map((item) => (
                          <label key={item.id} className="checkbox-item">
                            <span className="checkbox-label">
                              {item.access_name}
                            </span>
                            <input
                              type="checkbox"
                              checked={selectedAccess.includes(item.id)}
                              onChange={() => handleCheckboxChange(item.id)}
                            />
                          </label>
                        ))}
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="popup-footer">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <CircularProgress size={20} />
                  ) : (
                    t("common.save")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordPopup && (
        <div className="popup-overlay">
          <div className="popup-container modal-md">
            <div className="popup-header">
              <h2>{t("password.change_password")}</h2>
              <img
                src={CrossIcon}
                alt=""
                className="popup-close"
                onClick={closePasswordPopup}
              />
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="popup-body">
                <div className="form-container">
                  <ul className="form-row">
                    <li>
                      <label>{t("password.current_password")}</label>
                      <input
                        type={showPassword.current ? "text" : "password"}
                        name="current_password"
                        className="form-control"
                        placeholder={t("common.enter_placeholder")}
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                      />
                    </li>
                    <li>
                      <label>{t("password.new_password")}</label>
                      <input
                        type={showPassword.new ? "text" : "password"}
                        name="new_password"
                        className="form-control"
                        placeholder={t("common.enter_placeholder")}
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                      />
                    </li>
                    <li>
                      <label>{t("password.confirm_password")}</label>
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        name="new_password_confirmation"
                        className="form-control"
                        placeholder={t("common.enter_placeholder")}
                        value={passwordData.new_password_confirmation}
                        onChange={handlePasswordChange}
                      />
                    </li>
                  </ul>
                </div>
              </div>
              <div className="popup-footer">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmittingPassword}
                >
                  {isSubmittingPassword ? (
                    <CircularProgress size={20} />
                  ) : (
                    t("common.save")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
