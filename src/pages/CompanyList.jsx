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

const CompanyList = () => {
  const { t } = useTranslation();

  // ----------------- State -----------------
  const [loading, setLoading] = useState(false);
  const [companyList, setCompanyList] = useState([]);

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
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    street: "",
    postcode: "",
    city: "",
    country: "",
  });

  // ----------------- Handlers -----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddPopup = () => {
    setFormMode("add");
    setSelectedCompany(null);
    setFormData({
      name: "",
      street: "",
      postcode: "",
      city: "",
      country: "",
    });
    setShowPopup(true);
  };

  const openEditPopup = (company) => {
    setFormMode("edit");
    setSelectedCompany(company);
    setFormData({
      name: company.name || "",
      street: company.street || "",
      postcode: company.postcode || "",
      city: "",
      country: "",
    });
    setShowPopup(true);
  };

  const closePopup = () => setShowPopup(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formMode === "edit" && selectedCompany) {
      await updateCompany(selectedCompany.id, formData);
    } else {
      await addCompany(formData);
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
        response = await API.delete(`/admin/companies/${reqId}`);
      } else {
        response = await API.post(`/admin/companies/delete`, {
          ids: selectedIds,
        });
      }

      if (response?.data?.success) {
        toast.success(response?.data?.message || t("common.delete.success"), {
          theme: "dark",
          autoClose: 2000,
        });
        getCompanies();
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
  const getCompanies = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/companies", {
        search: searchTerm,
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      setCompanyList(data?.data?.companies || []);
      setTotalPages(data?.data?.last_page || 1);
      setTotalRecords(data?.data?.total || 0);
    } catch (error) {
      console.error("Error fetching companies:", error);
      setCompanyList([]);
    } finally {
      setLoading(false);
    }
  };

  const addCompany = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await API.post(`/companies`, data);
      toast.success(response?.data?.message || t("common.create.success"), {
        theme: "dark",
        autoClose: 2000,
      });
      getCompanies();
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

  const updateCompany = async (companyId, data) => {
    setIsSubmitting(true);
    try {
      const payload = { ...data, company_id: companyId };
      const response = await API.put(`/companies`, payload);
      toast.success(response?.data?.message || t("common.update.success"), {
        theme: "dark",
        autoClose: 2000,
      });
      getCompanies();
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
    getCompanies();
  }, [searchTerm, page, perPage, sortBy, sortOrder]);

  // ----------------- Render -----------------
  return (
    <div className="main">
      <AdminSidebar />
      <Header pageTitle={t("company.plural")} />
      <div className="container">
        <div className="dashboard-container">
          {/* --------- Companies Table --------- */}
          <div className="table-container">
            <div className="table-header">
              <h3 className="table-title">{t("company.plural")}</h3>
              <div className="table-actions">
                <input
                  type="text"
                  className="search-input"
                  placeholder={t("common.search_placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-primary" onClick={openAddPopup}>
                  {t("common.add")} {t("company.singular")}
                </button>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t("users.name")}</th>
                    <th>{t("company.street")}</th>
                    <th>{t("company.postcode")}</th>
                    <th>{t("company.city")}</th>
                    <th>{t("branch.plural")}</th>
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
                  ) : companyList.length > 0 ? (
                    companyList.map((company) => (
                      <tr key={company.id}>
                        <td>{company.name}</td>
                        <td>{company.street}</td>
                        <td>{company.postcode}</td>
                        <td>{company.city}</td>
                        <td>{company.branch_count}</td>
                        <td>
                          <button
                            className="btn-action btn-view"
                            onClick={() => openEditPopup(company)}
                          >
                            {t("common.edit")}
                          </button>
                          <button
                            className="btn-action btn-trash"
                            onClick={() => handleDelete(company.id)}
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

          {/* --------- Add/Edit Company Popup --------- */}
          {showPopup && (
            <div className="popup-overlay">
              <div className="popup-container modal-md">
                <div className="popup-header">
                  <h2>
                    {formMode === "edit"
                      ? `${t("common.edit")} ${t("company.singular")}`
                      : `${t("common.add")} ${t("company.singular")}`}
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
                          <label>{t("company.street")}</label>
                          <input
                            type="text"
                            name="street"
                            className="form-control"
                            placeholder={t("common.enter_placeholder")}
                            value={formData.street}
                            onChange={handleChange}
                          />
                        </li>
                        <li>
                          <label>{t("company.postcode")}</label>
                          <input
                            type="text"
                            name="postcode"
                            className="form-control"
                            placeholder={t("common.enter_placeholder")}
                            value={formData.postcode}
                            onChange={handleChange}
                          />
                        </li>
                        <li>
                          <label>{t("company.city")}</label>
                          <input
                            type="text"
                            name="city"
                            className="form-control"
                            placeholder={t("common.enter_placeholder")}
                            value={formData.city}
                            onChange={handleChange}
                          />
                        </li>
                        <li>
                          <label>{t("company.country")}</label>
                          <input
                            type="text"
                            name="country"
                            className="form-control"
                            placeholder={t("common.enter_placeholder")}
                            value={formData.country}
                            onChange={handleChange}
                          />
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
        aria-labelledby="delete-company-title"
        aria-describedby="delete-company-description"
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
                ? t("companies.delete_single_confirm")
                : t("companies.delete_selected_confirm")}
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

export default CompanyList;
