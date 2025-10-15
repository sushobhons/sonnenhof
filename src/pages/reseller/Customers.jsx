import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../../api/axios";
import { useTranslation } from "react-i18next";
import ResellerHeader from "../../layouts/ResellerHeader";
import ResellerSidebar from "../../layouts/ResellerSidebar";
import TableFooter from "../../layouts/TableFooter";

// import images
import { IMAGE_URL } from "../../utils/apiUrl";
import { exportToCSV, printData } from "@/utils/exportUtils";
import i18n from "../../i18n";
import useAuth from "../../auth/useAuth";
import { toast } from "react-toastify";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import {
  PdfIcon,
  FileIcon,
  CrossIcon,
  defaultProfileImg,
  warningImg,
} from "@/assets/images";

const ResellerCustomers = () => {
  // const publicUrl = import.meta.env.VITE_PUBLIC_URL;
  const { user } = useAuth();
  const id = user?.reseller_id;
  const [showPopup, setShowPopup] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(1);
  const [translations, setTranslations] = useState({});
  const [reqId, setReqId] = useState();
  const [selectedIds, setSelectedIds] = useState([]);
  const [open, setOpen] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  const { t } = useTranslation();
  const [selectedReseller, setSelectedReseller] = useState({});

  const [formData, setFormData] = useState({
    reseller_id: id,
    reseller_pricing_id: "",
    name: "",
    email: "",
    password: "",
    phone_number: "",
    business_name: "",
    customer_type: "",
    vat_number: "",
    tokens: 0,
    billing_info: "",
    deactivate_paypal: false,
    deactivate_stripe: false,
    is_auto_tune_available: false,
    force_vat: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pricingList, setPricingList] = useState([]);
  const [pageLoader, setPageLoader] = useState(false);
  const openPopup = () => setShowPopup(true);
  const closePopup = () => setShowPopup(false);

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("popupOverlay")) {
      setShowPopup(false);
    }
  };

  const getCustomers = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/reseller/customers`, {
        params: {
          searchTerm,
          fromDate,
          toDate,
          page,
          perPage,
          sortBy,
          sortOrder,
        },
      });
      setCustomers(response.data.data);
      setAllCustomers(response.data.data);
      setTotalPages(response.data.last_page);
      setTotalRecords(response.data.total);
    } catch (error) {
      console.error("Error fetching reseller customers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await API.post(`/resellers/customers`, formData);
      toast.success(response?.data?.message || t("common.create.success"), {
        theme: "dark",
        autoClose: 2000,
      });

      getCustomers();

      // Optionally reset form or close popup
      setFormData({
        reseller_id: id,
        reseller_pricing_id: "",
        name: "",
        email: "",
        password: "",
        phone_number: "",
        business_name: "",
        customer_type: "",
        vat_number: "",
        tokens: 0,
        billing_info: "",
        deactivate_paypal: false,
        deactivate_stripe: false,
        is_auto_tune_available: false,
        force_vat: false,
      });

      closePopup(); // if applicable
    } catch (error) {
      toast.error(error?.response?.data?.message || t("common.create.error"), {
        theme: "dark",
        autoClose: 2000,
      });
      console.error("Create customer error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = async () => {
    // console.log(currentOrders)
    printData(
      customers,
      [
        { key: "created_at", label: "Date & Time" },
        { key: "name", label: "Customer Name" },
        { key: "email", label: "Customer Email" },
        { key: "total_orders", label: "Total Orders" },
        { key: "total_tokens", label: "Total Tokens" },
      ],
      t("sidebar.customers")
    );
  };

  const handleCheckboxChange = (e, id) => {
    if (e.target.checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((customers) => customers !== id));
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(customers.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDelete = (id, type) => {
    if (type == "single") {
      if (id) {
        setOpen(true);
      }
    } else {
      if (!selectedIds.length) return;
      setOpen(true);
    }
  };

  const handleConfirmDelete = async (type) => {
    try {
      setDelLoading(true);
      let apiRes = "";
      if (type == "single") {
        apiRes = await API.delete(`/reseller/customers/${reqId}`);
      } else {
        apiRes = await API.post(`/reseller/customers/delete`, {
          ids: selectedIds,
        });
      }
      if (apiRes?.data?.success) {
        toast.success(t("common.delete.success"), { duration: 2000 });
        setOpen(false);
        getCustomers();
        if (type == "single") {
          setReqId();
        } else {
          setSelectedIds([]);
        }
      } else {
        toast.error(t("common.delete.error"), { duration: 2000 });
      }
    } catch (error) {
      console.error("Delete request failed:", error);
    } finally {
      setDelLoading(false);
    }
  };

  const handleExportCSV = async () => {
    exportToCSV(customers, `TuningFile-${t("sidebar.customers")}`, (item) => ({
      "Date & Time": item.created_at,
      "Customer Name": item.name,
      "Customer Email": item.email,
      "Total Orders": item.total_orders,
      "Total Tokens": item.total_tokens,
    }));
  };

  useEffect(() => {
    const fetchPricings = async () => {
      if (formData.reseller_id) {
        try {
          const response = await API.get(`/resellers/pricing`, {
            params: {
              reseller_id: formData.reseller_id,
            },
          });
          console.log(response.data.data);
          setPricingList(response.data.data);
        } catch (error) {
          console.error("Error fetching pricing list:", error);
          setPricingList([]);
        }
      } else {
        console.log(formData.reseller_id);
        setPricingList([]);
      }
    };

    fetchPricings();
  }, [formData.reseller_id]);

  const normalizeTranslations = (rawData) => {
    const result = {};

    for (const [namespace, entries] of Object.entries(rawData)) {
      result[namespace] = {};
      entries.forEach(({ key, text }) => {
        result[namespace][key] = text;
      });
    }

    return result;
  };
  const loadTranslations = async (lang) => {
    try {
      const response = await API.get(`languages/${lang}/translations`);
      const normalized = normalizeTranslations(response.data?.data || {});
      setTranslations(normalized);
    } catch (error) {
      console.error("Failed to load translations.");
    }
  };

  useEffect(() => {
    loadTranslations(i18n.language);
  }, [i18n.language]);

  const getTranslation = (namespace, key) => {
    return translations?.[namespace]?.[key] ?? key;
  };

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = allCustomers.filter((cust) => {
      return (
        cust.name.toLowerCase().includes(lowerSearch) ||
        cust.email.toLowerCase().includes(lowerSearch) ||
        String(cust.total_orders).includes(lowerSearch) ||
        String(cust.total_tokens).includes(lowerSearch)
      );
    });

    setCustomers(filtered);
  }, [searchTerm, allCustomers]);

  useEffect(() => {
    getCustomers();
  }, [searchTerm, fromDate, toDate, page, perPage, sortBy, sortOrder]);

  const handleSort = (column) => {
    setSortBy(column);
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="fullWidth">
      <div className="main">
        <ResellerSidebar />
        <div className="container">
          <ResellerHeader pageTitle={t("sidebar.customers")} />
          <div className="mainInnerDiv">
            <div className="dashTop">
              <h2>{t("sidebar.customers")}</h2>
            </div>
            <div className="resellerFilter">
              <div className="searchFilter">
                <input
                  type="text"
                  placeholder={t("common.search_here")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                />
                {/* <div className="dateFilter">
                    <span>
                      {t("common.from")}{" "}
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </span>
                    <span>
                      {t("common.to")}{" "}
                      <input
                        type="date"
                        className="date2"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                      />
                    </span>
                  </div> */}
              </div>

              <div className="sortFilter">
                <button
                  className="deleteBtn"
                  disabled={selectedIds.length === 0}
                  onClick={() => handleDelete("", "multiple")}
                >
                  {t("common.delete")}
                </button>
                <button className="pdfBtn">
                  <img
                    src={PdfIcon}
                    alt={t("common.pdf")}
                    onClick={() => handlePrint()}
                  />
                </button>
                <button className="fileBtn">
                  <img
                    src={FileIcon}
                    alt={t("common.file")}
                    onClick={() => handleExportCSV()}
                  />
                </button>
                <Link className="addBtn" onClick={openPopup}>
                  {t("common.add_new")}
                </Link>
              </div>
            </div>

            <div className="resellerTable customer-list">
              <table className="custom-data-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length === customers.length &&
                          customers.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>{t("common.profile_pic")}</th>
                    {/* <th onClick={() => handleSort("id")}>ID</th> */}
                    <th
                      onClick={() => handleSort("created_at")}
                      className={`sortable ${
                        sortBy === "created_at" ? sortOrder : ""
                      }`}
                    >
                      {t("common.date")}
                    </th>
                    <th
                      onClick={() => handleSort("name")}
                      className={`sortable ${
                        sortBy === "name" ? sortOrder : ""
                      }`}
                    >
                      {t("common.name")}
                    </th>
                    <th
                      onClick={() => handleSort("email")}
                      className={`sortable ${
                        sortBy === "email" ? sortOrder : ""
                      }`}
                    >
                      {t("common.email")}
                    </th>
                    <th
                      onClick={() => handleSort("phone")}
                      className={`sortable ${
                        sortBy === "phone" ? sortOrder : ""
                      }`}
                    >
                      {t("common.phone")}
                    </th>
                    <th>{t("customer.total_orders")}</th>
                    <th>{t("customer.total_tokens")}</th>
                    <th className="right-side">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="12"
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        {t("common.loading")}...
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr key={customer.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(customer.id)}
                            onChange={(e) =>
                              handleCheckboxChange(e, customer.id)
                            }
                          />
                        </td>
                        <td>
                          <img
                            src={
                              customer.profile_pic
                                ? customer.profile_pic
                                : defaultProfileImg
                            }
                            alt=""
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "100%",
                            }}
                          />
                        </td>
                        {/* <td>{customer.code}</td> */}
                        <td>{customer.created_at}</td>
                        <td>{customer.name}</td>
                        <td>{customer.email}</td>
                        <td>{customer.phone}</td>
                        <td>{customer.total_orders}</td>
                        <td>{customer.total_tokens}</td>
                        <td>
                          <Link
                            to={`/admin/customers/${customer.id}`}
                            className="viewBtn"
                          >
                            {t("common.view")}
                          </Link>
                          <button
                            className="trashBtn"
                            onClick={() => {
                              handleDelete(customer.id, "single");
                              setReqId(customer.id);
                            }}
                          >
                            {t("common.delete")}
                          </button>
                        </td>
                      </tr>
                    ))
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

            {showPopup && (
              <div className="popupOverlay">
                <div className="popupContent2 modalXl">
                  <div className="popupHeader">
                    <h2>{t("common.add_new")}</h2>
                    <img
                      src={CrossIcon}
                      alt=""
                      className="closeBtn"
                      onClick={closePopup}
                    />
                  </div>

                  <div className="resellerForm addCustomerPopup">
                    <ul>
                      <li>
                        <label>{t("reseller.services")}</label>
                        <input
                          type="hidden"
                          name="reseller_id"
                          value={formData.reseller_id}
                        />
                        <select
                          name="reseller_pricing_id"
                          value={formData.reseller_pricing_id}
                          onChange={handleChange}
                        >
                          <option value="">Choose here</option>
                          {pricingList.map((pricing) => (
                            <option key={pricing.id} value={pricing.id}>
                              {pricing.title}
                            </option>
                          ))}
                        </select>
                      </li>
                      <li>
                        <label>{t("common.name")}</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </li>
                      <li>
                        <label>{t("common.email")}</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="Enter register email"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </li>
                      <li>
                        <label>{t("common.password")}</label>
                        <input
                          type="password"
                          name="password"
                          placeholder="Enter password"
                          value={formData.password}
                          onChange={handleChange}
                        />
                      </li>

                      <li>
                        <label>{t("common.phone_number")}</label>
                        <input
                          type="text"
                          name="phone_number"
                          placeholder="Enter phone no."
                          value={formData.phone_number}
                          onChange={handleChange}
                        />
                      </li>
                      <li>
                        <label>Customer type</label>
                        <select
                          name="customer_type"
                          value={formData.customer_type}
                          onChange={handleChange}
                        >
                          <option value="">Choose here</option>
                          <option value={1}>
                            {getTranslation("common", "PersonalUserType")}
                          </option>
                          <option value={3}>
                            {getTranslation("common", "NoVATSociety")}
                          </option>
                          <option value={2}>
                            {getTranslation("common", "SocietyInTerritory")}{" "}
                            {selectedReseller?.country_code || "FR"}
                          </option>
                          <option value={4}>
                            {getTranslation("common", "SocietyExtraTerritory")}{" "}
                            {selectedReseller?.country_code || "FR"}
                          </option>
                        </select>
                      </li>
                      <li>
                        <label>{t("common.business_name")}</label>
                        <input
                          type="text"
                          name="business_name"
                          value={formData.business_name}
                          onChange={handleChange}
                        />
                      </li>
                      <li>
                        <label>{t("reseller.vat_number")}</label>
                        <input
                          type="text"
                          name="vat_number"
                          value={formData.vat_number}
                          onChange={handleChange}
                        />
                      </li>
                      <li>
                        <label>{t("account.tokens")}</label>
                        <input
                          type="number"
                          name="tokens"
                          placeholder="0"
                          value={formData.tokens}
                          onChange={handleChange}
                        />
                      </li>
                      <li>
                        <label>{t("customer.billing_information")}</label>
                        <input
                          type="text"
                          name="billing_info"
                          placeholder=""
                          value={formData.billing_info}
                          onChange={handleChange}
                        />
                      </li>
                      <li>
                        <div className="checkForm">
                          <span>{t("customer.disable_paypal_payment")}</span>
                          <input
                            type="checkbox"
                            name="deactivate_paypal"
                            checked={formData.deactivate_paypal}
                            onChange={handleChange}
                          />
                        </div>
                      </li>
                      <li>
                        <div className="checkForm">
                          <span>{t("customer.disable_stripe_payment")}</span>
                          <input
                            type="checkbox"
                            name="deactivate_paypal"
                            checked={formData.deactivate_paypal}
                            onChange={handleChange}
                          />
                        </div>
                      </li>
                      <li>
                        <div className="checkForm">
                          <span>{t("customer.force_vat")}</span>
                          <input
                            type="checkbox"
                            name="force_vat"
                            checked={formData.force_vat}
                            onChange={handleChange}
                          />
                        </div>
                      </li>
                      <li>
                        <div className="checkForm">
                          <span>{t("reseller.auto_tune_available")}</span>
                          <input
                            type="checkbox"
                            name="is_auto_tune_available"
                            checked={formData.is_auto_tune_available}
                            onChange={handleChange}
                          />
                        </div>
                      </li>
                    </ul>
                    <div className="popBtns">
                      <button
                        type="submit"
                        className="saveBtn"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <CircularProgress
                            size={20}
                            style={{ color: "white" }}
                          />
                        ) : (
                          t("common.save")
                        )}
                      </button>
                      {/* <button className="closeBtn2" onClick={closePopup}>
                                            Close
                                          </button> */}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* --Delete Popup-- */}
        <Modal
          open={open}
          onClose={() => {
            setOpen(false);
          }}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            className="modal-box warning-modal-box"
            style={{ height: "400px", width: "445px" }}
          >
            <div className="modal-body">
              <img src={warningImg} alt="" />
              <h3>{t("common.delete")}!</h3>
              {selectedIds?.length > 0 ? (
                <p>{t("customer.delete_selected_confirm")}</p>
              ) : (
                <p>{t("customer.delete_single_confirm")}</p>
              )}

              <ul className="signup-form-list">
                <li>
                  <div className="modal-btn-group">
                    <button
                      type="button"
                      className="black-btn"
                      disabled={delLoading}
                      style={{
                        cursor: delLoading ? "not-allowed" : "pointer",
                        opacity: delLoading ? "0.5" : "1",
                        width: "94px",
                        justifyContent: "center",
                      }}
                      onClick={() => {
                        if (reqId) {
                          handleConfirmDelete("single");
                        } else {
                          handleConfirmDelete("multiple");
                        }
                      }}
                    >
                      {delLoading ? (
                        <CircularProgress
                          size="25px"
                          style={{ color: "white" }}
                        />
                      ) : (
                        t("common.delete")
                      )}
                    </button>
                    <button
                      type="button"
                      className="white-btn"
                      onClick={() => {
                        setOpen(false);
                        setReqId();
                      }}
                    >
                      {t("common.cancel")}
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default ResellerCustomers;
