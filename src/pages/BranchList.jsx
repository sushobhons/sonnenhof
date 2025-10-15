import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import AdminSidebar from "../layouts/AdminSidebar";
import Header from "../layouts/AdminHeader";
import TableFooter from "../layouts/TableFooter";
import API from "../api/axios";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { warningImg, CrossIcon } from "@/assets/images";

const BranchList = () => {
  const { t } = useTranslation();

  // ----------------- State -----------------
  const [loading, setLoading] = useState(false);
  const [userList, setBranchList] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(1);

  const [selectedIds, setSelectedIds] = useState([]);
  const [reqId, setReqId] = useState(null);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  const [formMode, setFormMode] = useState("add"); // add | edit
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    role_id: "",
    name: "",
    email: "",
    username: "",
    password: "",
    password_confirmation: "",
  });

  const [userTypeList, setBranchTypeList] = useState([]);

  // ----------------- Handlers -----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddPopup = () => {
    setFormMode("add");
    setSelectedBranch(null);
    setFormData({
      role_id: "",
      name: "",
      email: "",
      username: "",
      password: "",
      password_confirmation: "",
    });
    setShowPopup(true);
  };

  const openEditPopup = (user) => {
    setFormMode("edit");
    setSelectedBranch(user);
    setFormData({
      role_id: user.role_id || "",
      name: user.name || "",
      email: user.email || "",
      username: user.username || "",
      password: "",
      password_confirmation: "",
    });
    setShowPopup(true);
  };

  const closePopup = () => setShowPopup(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formMode === "edit" && selectedBranch) {
      await updateBranch(selectedBranch.id, formData);
    } else {
      await addBranch(formData);
    }
  };

  const handleDelete = (id) => {
    setReqId(id || null);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDelLoading(true);
      let response;

      if (reqId) {
        response = await API.delete(`/admin/branches/${reqId}`);
      } else {
        response = await API.post(`/admin/branches/delete`, {
          ids: selectedIds,
        });
      }

      if (response?.data?.success) {
        toast.success(response?.data?.message || t("common.delete.success"), {
          theme: "dark",
          autoClose: 2000,
        });
        getBranchs();
        setSelectedIds([]);
        setReqId(null);
        setOpenDeleteModal(false);
      } else {
        toast.error(t("common.delete.error"), {
          theme: "dark",
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDelLoading(false);
    }
  };

  // ----------------- API Calls -----------------
  const getBranchs = async () => {
    try {
      setLoading(true);
      const { data } = await API.post("/admin/user-list", {
        search: searchTerm,
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      setBranchList(data?.data?.branches || []);
      setTotalPages(data?.data?.last_page || 1);
      setTotalRecords(data?.data?.total || 0);
    } catch (error) {
      console.error("Error fetching branches:", error);
      setBranchList([]);
    } finally {
      setLoading(false);
    }
  };

  const getRoles = async () => {
    try {
      const { data } = await API.get("/admin/roles");
      setBranchTypeList(data?.data || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setBranchTypeList([]);
    }
  };

  const addBranch = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await API.post(`/admin/add-user`, data);
      toast.success(response?.data?.message || t("common.create.success"), {
        theme: "dark",
        autoClose: 2000,
      });
      getBranchs();
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

  const updateBranch = async (userId, data) => {
    setIsSubmitting(true);
    try {
      const payload = { ...data, user_id: userId };
      const response = await API.post(`/admin/update-user`, payload);
      toast.success(response?.data?.message || t("common.update.success"), {
        theme: "dark",
        autoClose: 2000,
      });
      getBranchs();
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

  // ----------------- Effects -----------------
  useEffect(() => {
    getBranchs();
  }, [searchTerm, page, perPage, sortBy, sortOrder]);

  useEffect(() => {
    getRoles();
  }, []);

  // ----------------- Render -----------------
  return (
    <div className="main">
      <AdminSidebar />
      <Header pageTitle={t("sidebar.branches")} />
      <div className="container">
        <div className="dashboard-container">
          {/* --------- Branchs Table --------- */}
          <div className="table-container">
            <div className="table-header">
              <h3 className="table-title">{t("branches.list_title")}</h3>
              <div className="table-actions">
                <input
                  type="text"
                  className="search-input"
                  placeholder={t("common.search_placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-primary" onClick={openAddPopup}>
                  {t("branches.add")}
                </button>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t("branches.user_id")}</th>
                    <th>{t("branches.user_type")}</th>
                    <th>{t("branches.email")}</th>
                    <th>{t("branches.username")}</th>
                    <th>{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="loading-cell">
                        {t("common.loading")}...
                      </td>
                    </tr>
                  ) : userList.length > 0 ? (
                    userList.map((user) => (
                      <tr key={user.id}>
                        <td>{user.user_key}</td>
                        <td>{user.role}</td>
                        <td>{user.email}</td>
                        <td>{user.username}</td>
                        <td>
                          <button
                            className="btn-action btn-view"
                            onClick={() => openEditPopup(user)}
                          >
                            {t("common.edit")}
                          </button>
                          <button
                            className="btn-action btn-trash"
                            onClick={() => handleDelete(user.id)}
                          >
                            {t("common.delete")}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center" }}>
                        {t("common.result.no_record")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <TableFooter
              page={page}
              perPage={perPage}
              totalRecords={totalRecords}
              onPageChange={setPage}
              onPerPageChange={setPerPage}
            />
          </div>

          {/* --------- Add/Edit Branch Popup --------- */}
          {showPopup && (
            <div className="popup-overlay">
              <div className="popup-container modal-md">
                <div className="popup-header">
                  <h2>
                    {formMode === "edit"
                      ? `${t("branches.edit")}`
                      : `${t("branches.add")}`}
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
                          <label>{t("branches.user_type")}</label>
                          <select
                            name="role_id"
                            className="form-control"
                            value={formData.role_id}
                            onChange={handleChange}
                          >
                            <option value="" disabled>
                              {t("common.select_placeholder")}
                            </option>
                            {userTypeList.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.role_name}
                              </option>
                            ))}
                          </select>
                        </li>
                        <li>
                          <label>{t("branches.name")}</label>
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
                          <label>{t("branches.email")}</label>
                          <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder={t("common.enter_placeholder")}
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </li>
                        <li>
                          <label>{t("branches.username")}</label>
                          <input
                            type="text"
                            name="username"
                            className="form-control"
                            placeholder={t("common.enter_placeholder")}
                            value={formData.username}
                            onChange={handleChange}
                          />
                        </li>
                        <li>
                          <label>{t("password.title")}</label>
                          <input
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder={t("common.enter_placeholder")}
                            value={formData.password}
                            onChange={handleChange}
                          />
                        </li>
                        {/* <li>
                            <label>{t("password.confirm_password")}</label>
                            <input
                              type="password"
                              name="password_confirmation"
                              className="form-control"
                              placeholder={t("common.enter_placeholder")}
                              value={formData.password_confirmation}
                              onChange={handleChange}
                            />
                          </li> */}
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
                        <CircularProgress
                          size={20}
                          style={{ color: "#0f4166" }}
                        />
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
      </div>
      {/* --------- Delete Confirmation Modal --------- */}
      <Modal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        aria-labelledby="delete-user-title"
        aria-describedby="delete-user-description"
      >
        <Box
          className="modal-box warning-modal-box"
          sx={{ height: 400, width: 445 }}
        >
          <div className="modal-body">
            <img src={warningImg} alt="Warning" />
            <h3>{t("common.delete")}!</h3>
            <p>
              {reqId
                ? t("branches.delete_single_confirm")
                : t("branches.delete_selected_confirm")}
            </p>
            <div className="modal-btn-group">
              <button
                type="button"
                className="black-btn"
                disabled={delLoading}
                onClick={handleConfirmDelete}
              >
                {delLoading ? (
                  <CircularProgress size={25} style={{ color: "white" }} />
                ) : (
                  t("common.delete")
                )}
              </button>
              <button
                type="button"
                className="white-btn"
                onClick={() => {
                  setOpenDeleteModal(false);
                  setReqId(null);
                }}
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default BranchList;
