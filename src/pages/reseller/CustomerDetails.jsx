import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../../api/axios";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Skeleton from "@mui/material/Skeleton";
import Avatar from "@mui/material/Avatar";
import ResellerSidebar from "@layouts/ResellerSidebar";
import ResellerHeader from "@layouts/ResellerHeader";
import TableFooter from "@layouts/TableFooter";
import { exportToCSV, printData } from "@/utils/exportUtils";
import {
  BackIcon,
  PdfIcon,
  FileIcon,
  barsIcon,
  defaultProfileImg,
  warningImg,
} from "@/assets/images";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { IMAGE_URL } from "../../utils/apiUrl";

const ResellerCustomerDetails = () => {
  const publicUrl = import.meta.env.VITE_IMG_URL;
  const popoverRef = useRef(null);
  const [activeTab, setActiveTab] = useState("order");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const [pdfDatas, setPdfDatas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pricingOptions, setPricingOptions] = useState([]);
  const [singleClick, setSingleClick] = useState(false);

  const [showColumnPopover, setShowColumnPopover] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    date: { visible: true, label: "common.date" },
    id: { visible: true, label: "common.id" },
    status: { visible: true, label: "common.status" },
    name: { visible: true, label: "common.name" },
    email: { visible: true, label: "order.email" },
    company: { visible: true, label: "reseller.company" },
    vehicle: { visible: false, label: "common.vehicle" },
    vehicle_manufacturer: { visible: true, label: "vehicle.manufacturer" },
    stage: { visible: false, label: "order.stage" },
    series: { visible: false, label: "vehicle.series" },
    version: { visible: false, label: "vehicle.version" },
    total: { visible: false, label: "billing.total_excl_tax" },
    incl_price: { visible: false, label: "billing.total_incl_tax" },
    model: { visible: true, label: "vehicle.model" },
    year: { visible: false, label: "vehicle.year" },
    mileage: { visible: false, label: "vehicle.mileage" },
    type: { visible: false, label: "engine.type" },
    vin: { visible: true, label: "engine.vin" },
    manufacturer: { visible: false, label: "ecu.manufacturer" },
    hardware: { visible: false, label: "ecu.hardware" },
    transmission: { visible: false, label: "engine.transmission" },
    software: { visible: false, label: "ecu.software" },
    read_hardware: { visible: false, label: "common.read_hardware" },
    total_excl_tax: { visible: false, label: "billing.total_excl_tax" },
    total_incl_tax: { visible: true, label: "billing.total_incl_tax" },
    vat: { visible: false, label: "billing.vat" },
    order_paid: { visible: true, label: "order.order_paid" },
    paypal_error: { visible: true, label: "order.paypal_error" },
    is_auto_tuned: { visible: true, label: "Auto Tune" },
    actions: { visible: true, label: "common.actions" },
  });
  const [customerDetails, setCustomerDetails] = useState({
    reseller: "",
    reseller_pricing_id: "",
    email: "",
    tokens: 0,
    name: "",
    business_name: "",
    phone_number: "",
    vat_number: "",
    billing: "",
    deactivate_paypal: false,
    deactivate_stripe: false,
    force_vat: false,
    is_auto_tune_available: false,
  });

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [status, setStatus] = useState("");
  const [pointsArr, setPointsArray] = useState([]);
  // const [resellerId, setResellerId] = useState("");

  // const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteId(null);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleteLoading(true);
      const res = await API.delete(`/orders/${deleteId}`);

      if (res?.data?.success) {
        toast.success(t("common.delete.success"), { duration: 2000 });
        closeDeleteModal();
        getOrders(); // refresh list
      } else {
        toast.error(t("common.delete.error"), { duration: 2000 });
      }
    } catch (err) {
      console.error("Delete request failed:", err);
      toast.error(t("common.delete.error"), { duration: 2000 });
    } finally {
      setDeleteLoading(false);
    }
  };

  const statusMap = {
    1: { labelKey: "order.status_waiting", className: "waiting" },
    2: { labelKey: "order.status_pending", className: "pending" },
    3: { labelKey: "order.status_completed", className: "completed" },
    4: { labelKey: "order.status_cancelled", className: "cancelled" },
  };

  const getPricings = async () => {
    try {
      const response = await API.get("/resellers/pricing", {
        params: {
          search,
          page,
          perPage,
          sortBy,
          sortOrder,
        },
      });

      setPricingOptions(response.data.data); // use this for select box
    } catch (error) {
      console.error("Error fetching resellers", error);
    }
  };

  const getgCustomerDetails = async () => {
    try {
      const response = await API.get(`/customers/${id}`);
      const customer = response.data.data;
      setCustomer(customer);
      setCustomerDetails({
        profile_pic: customer.profile_pic || "",
        name: customer.user?.name || "",
        username: customer.user?.username || "",
        email: customer.user?.email || "",
        password: "",
        tokens: customer?.tokens || 0,
        phone_number: customer.phone_number || "",
        business_name: customer.business_name || "",
        reseller_pricing_id: customer.reseller_pricing_id || "",
        vat_number: customer.vat_number || "",
        deactivate_paypal: !!customer.deactivate_paypal,
        deactivate_stripe: !!customer.deactivate_stripe,
        force_vat: !!customer.force_vat,
        is_auto_tune_available: !!customer.is_auto_tune_available,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || t("common.fetch.error"), {
        theme: "dark",
        autoClose: 2000,
      });
    }
  };

  const getOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/customers/${id}/orders`, {
        params: {
          status,
          from_date: fromDate,
          to_date: toDate,
          page,
          perPage,
          sortBy,
          sortOrder,
        },
      });

      setOrders(response.data.data);
      setTotalPages(response.data.last_page);
      setTotalRecords(response.data.total);
      setPdfDatas(
        response.data.data.map((order) => ({
          created_at: order.created_at,
          order_key: order.order_key,
          reseller_name: order.reseller?.name,
          customer_email: order.customer?.email,
          total_exc_price: order.total_exc_price,
          total_inc_price: order.total_inc_price,
        }))
      );
    } catch (error) {
      console.error("Error fetching orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (e, id) => {
    if (e.target.checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((resellerId) => resellerId !== id));
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(orders.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSort = (column) => {
    setSortBy(column);
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCustomerDetails((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleColumnSorting = () => {
    setShowColumnPopover(!showColumnPopover);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { username, ...payload } = customerDetails;

      const response = await API.put(`/customers/${id}`, payload);

      toast.success(response?.data?.message || t("common.update.success"), {
        theme: "dark",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || t("common.update.error"), {
        theme: "dark",
        autoClose: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchAllPurchasedPoits = async () => {
    try {
      const response = await API.get(`/customers/${id}/point-history`);
      if (response.data.success) {
        if (response.data.data?.length > 0) {
          setPointsArray(response.data.data);
        } else {
          setPointsArray([]);
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching resellers", error);
    }
  };

  const handlePointsSort = (field) => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(order);
    setSortBy(field);

    const sorted = [...pointsArr].sort((a, b) => {
      if (field === "date") {
        return order === "asc"
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      }

      if (field === "date") {
        return order === "asc"
          ? a.reseller.name.localeCompare(b.reseller.name)
          : b.reseller.name.localeCompare(a.reseller.name);
      }

      return 0;
    });

    setPointsArray(sorted);
  };

  const placeOrderForReseller = async (id) => {
    try {
      setSingleClick(true);
      const formData = new FormData();
      formData.append("user_id", id);
      const apiRes = await API.post(`/customers/reseller-login`, formData);
      // console.log(apiRes);
      if (apiRes.data.status) {
        // console.log(apiRes.data.data);
        localStorage.setItem(
          "VehicleTunningCredential",
          JSON.stringify(apiRes.data.data)
        );
        navigate(`/`);
        setSingleClick(false);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || t("common.delete.error"), {
        theme: "dark",
        autoClose: 2000,
      });
    }
  };

  const handlePrint = async () => {
    printData(
      pdfDatas,
      [
        { key: "order_key", label: "Order ID" },
        { key: "created_at", label: "Date & Time" },
        { key: "reseller_name", label: "Reseller Name" },
        { key: "customer_email", label: "Customer Email" },
        { key: "total_exc_price", label: "Total (Excl. Tax)" },
        { key: "total_inc_price", label: "Total (Incl. Tax)" },
      ],
      t("order.my_orders")
    );
  };

  const handleExportCSV = async () => {
    exportToCSV(pdfDatas, `TuningFile-${t("order.my_orders")}`, (item) => ({
      "Order ID": item.order_key,
      "Date & Time": item.created_at,
      "Reseller Name": item.reseller_name,
      "Customer Email": item.customer_email,
      "Total (Excl. Tax)": item.total_exc_price,
      "Total (Incl. Tax)": item.total_inc_price,
    }));
  };

  useEffect(() => {
    getPricings();
    getOrders();
    getgCustomerDetails();
  }, [search, fromDate, toDate, page, perPage, sortBy, sortOrder]);

  const markOrderAsPaid = async () => {
    if (!selectedIds.length) return;
    try {
      await API.post(`/orders/mark-paid`, { ids: selectedIds });
      getOrders();
      setSelectedIds([]);
    } catch (error) {
      toast.error(error?.response?.data?.message || t("common.delete.error"), {
        theme: "dark",
        autoClose: 2000,
      });
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowColumnPopover(false);
      }
    }

    if (showColumnPopover) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColumnPopover]);

  return (
    <div className="fullWidth">
      <div className="main">
        <ResellerSidebar />
        <div className="container">
          <ResellerHeader pageTitle={t("sidebar.customers")} />
          <div className="mainInnerDiv">
            <div className="resellerInner">
              <div className="dashTop">
                <h2 className="resellerHdn">
                  <Link to="/admin/customers">
                    <img src={BackIcon} alt="" />
                  </Link>
                  {!customer ? (
                    <>
                      <Skeleton variant="circular">
                        <Avatar />
                      </Skeleton>
                      <Skeleton variant="rectangular" width={210} height={30} />
                    </>
                  ) : (
                    <>
                      <img
                        src={
                          customer.profile_pic
                            ? publicUrl + customer.profile_pic
                            : defaultProfileImg
                        }
                        alt=""
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "100%",
                        }}
                      />
                      {customerDetails.name}
                    </>
                  )}
                </h2>

                <div className="resellerBtns">
                  <button
                    className="greenBtn"
                    disabled={singleClick}
                    style={{ opacity: singleClick ? "0.5" : "1" }}
                    onClick={() => placeOrderForReseller(customer?.user?.id)}
                  >
                    {t("order.place_order")}
                  </button>
                  <button
                    type="submit"
                    className="saveBtn"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={20} style={{ color: "white" }} />
                    ) : (
                      t("common.save")
                    )}
                  </button>
                  {/* <button className="trashBtn">{t("common.delete")}</button> */}
                </div>
              </div>

              <div className="resellerForm resellerOrderForm">
                <ul>
                  <li>
                    <label>{t("reseller.services")}</label>
                    <select
                      name="reseller_pricing_id"
                      value={customerDetails.reseller_pricing_id || ""}
                      onChange={handleChange}
                      disabled={pricingOptions.length === 0}
                    >
                      <option value="">{t("common.select_here")}</option>
                      {pricingOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.title}
                        </option>
                      ))}
                    </select>
                  </li>
                  <li>
                    <label>{t("common.name")}</label>
                    <input
                      type="text"
                      name="name"
                      value={customerDetails.name || ""}
                      onChange={handleChange}
                    />
                  </li>
                  <li>
                    <label>{t("common.email")}</label>
                    <input
                      type="email"
                      name="email"
                      value={customerDetails.email || ""}
                      onChange={handleChange}
                    />
                  </li>

                  <li>
                    <label>{t("common.password")}</label>
                    <input
                      type="password"
                      name="password"
                      value={customerDetails.password}
                      onChange={handleChange}
                    />
                  </li>

                  <li>
                    <label>{t("account.tokens")}</label>
                    <input
                      type="number"
                      name="tokens"
                      value={customerDetails.tokens || ""}
                      onChange={handleChange}
                    />
                  </li>

                  <li>
                    <label>{t("reseller.company")}</label>
                    <input
                      type="text"
                      name="business_name"
                      value={customerDetails.business_name || ""}
                      onChange={handleChange}
                    />
                  </li>

                  <li>
                    <label>{t("common.phone")}</label>
                    <input
                      type="text"
                      name="phone_number"
                      value={customerDetails.phone_number || ""}
                      onChange={handleChange}
                    />
                  </li>

                  <li>
                    <label>{t("reseller.vat_number")}</label>
                    <input
                      type="text"
                      name="vat_number"
                      value={customerDetails.vat_number || ""}
                      onChange={handleChange}
                    />
                  </li>

                  <li>
                    <label>{t("customer.billing_information")}</label>
                    <input
                      type="text"
                      name="billing_info"
                      value={customerDetails.billing_info || ""}
                      onChange={handleChange}
                    />
                  </li>

                  <li>
                    <div className="checkForm">
                      <span>{t("customer.disable_paypal_payment")}</span>
                      <input
                        type="checkbox"
                        name="deactivate_paypal"
                        checked={!!customerDetails.deactivate_paypal}
                        onChange={(e) =>
                          setCustomerDetails((prev) => ({
                            ...prev,
                            deactivate_paypal: e.target.checked,
                          }))
                        }
                      />
                    </div>
                  </li>
                  <li>
                    <div className="checkForm">
                      <span>{t("customer.disable_stripe_payment")}</span>
                      <input
                        type="checkbox"
                        name="deactivate_stripe"
                        checked={!!customerDetails.deactivate_stripe}
                        onChange={(e) =>
                          setCustomerDetails((prev) => ({
                            ...prev,
                            deactivate_stripe: e.target.checked,
                          }))
                        }
                      />
                    </div>
                  </li>

                  <li>
                    <div className="checkForm">
                      <span>{t("customer.force_vat")}</span>
                      <input
                        type="checkbox"
                        name="force_vat"
                        checked={!!customerDetails.force_vat}
                        onChange={(e) =>
                          setCustomerDetails((prev) => ({
                            ...prev,
                            force_vat: e.target.checked,
                          }))
                        }
                      />
                    </div>
                  </li>

                  <li>
                    <div className="checkForm">
                      <span>{t("reseller.auto_tune_available")}</span>
                      <input
                        type="checkbox"
                        name="is_auto_tune_available"
                        checked={customerDetails.is_auto_tune_available}
                        onChange={handleChange}
                      />
                    </div>
                  </li>
                </ul>
              </div>

              <div className="resellerNav">
                <ul>
                  <li>
                    <Link
                      className={activeTab === "order" ? "active" : ""}
                      onClick={() => setActiveTab("order")}
                    >
                      {t("order.title_plural")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={activeTab === "points" ? "active" : ""}
                      onClick={() => {
                        setActiveTab("points");
                        fetchAllPurchasedPoits();
                      }}
                    >
                      {t("account.buy_tokens")}
                    </Link>
                  </li>
                </ul>
              </div>

              {activeTab === "order" && (
                <div className="resellerTab orderTab">
                  <div className="resellerFilter">
                    <div className="searchFilter">
                      <div className="salesDrop">
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                        >
                          <option value="">{t("order.status")}</option>
                          <option value="1">{t("order.status_waiting")}</option>
                          <option value="2">{t("order.status_pending")}</option>
                          <option value="3">
                            {t("order.status_completed")}
                          </option>
                          <option value="4">
                            {t("order.status_cancelled")}
                          </option>
                        </select>
                      </div>
                      <div className="dateFilter">
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
                      </div>
                    </div>

                    <div className="sortFilter">
                      <button
                        className="paid-order deleteBtn"
                        disabled={selectedIds.length === 0}
                        onClick={() => markOrderAsPaid()}
                      >
                        {t("order.mark_paid")}
                      </button>
                      <button
                        className="print-btn"
                        onClick={handleColumnSorting}
                      >
                        <img src={barsIcon} alt="column" />
                      </button>
                      {showColumnPopover && (
                        <div ref={popoverRef} className="column-popover">
                          {Object.entries(visibleColumns).map(([key, col]) => (
                            <div
                              key={key}
                              className={`column-popover-item ${
                                col.visible ? "active" : ""
                              }`}
                              onClick={() =>
                                setVisibleColumns((prev) => ({
                                  ...prev,
                                  [key]: {
                                    ...prev[key],
                                    visible: !prev[key].visible,
                                  },
                                }))
                              }
                            >
                              {t(col.label)}
                            </div>
                          ))}
                        </div>
                      )}
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
                    </div>
                  </div>

                  <div className="resellerTable">
                    <table className="custom-data-table">
                      <thead>
                        <tr>
                          <th>
                            <input
                              type="checkbox"
                              checked={
                                selectedIds.length === orders.length &&
                                orders.length > 0
                              }
                              onChange={handleSelectAll}
                            />
                          </th>
                          {visibleColumns.date?.visible && (
                            <th
                              onClick={() => handleSort("created_at")}
                              className={`sortable ${
                                sortBy === "created_at" ? sortOrder : ""
                              }`}
                            >
                              <span>{t(visibleColumns.date.label)}</span>
                            </th>
                          )}

                          {visibleColumns.id?.visible && (
                            <th>
                              <span>{t(visibleColumns.id.label)}</span>
                            </th>
                          )}

                          {visibleColumns.status?.visible && (
                            <th>
                              <span>{t(visibleColumns.status.label)}</span>
                            </th>
                          )}

                          {visibleColumns.name?.visible && (
                            <th>
                              <span>{t(visibleColumns.name.label)}</span>
                            </th>
                          )}

                          {visibleColumns.email?.visible && (
                            <th>
                              <span>{t(visibleColumns.email.label)}</span>
                            </th>
                          )}

                          {visibleColumns.company?.visible && (
                            <th>
                              <span>{t(visibleColumns.company.label)}</span>
                            </th>
                          )}

                          {visibleColumns.vehicle?.visible && (
                            <th onClick={() => handleSort("vehicle")}>
                              <span>{t(visibleColumns.vehicle.label)}</span>
                            </th>
                          )}
                          {visibleColumns.vehicle_manufacturer?.visible && (
                            <th
                              onClick={() => handleSort("vehicle_manufacturer")}
                            >
                              <span>
                                {t(visibleColumns.vehicle_manufacturer.label)}
                              </span>
                            </th>
                          )}
                          {visibleColumns.stage?.visible && (
                            <th>
                              <span>{t(visibleColumns.stage.label)}</span>
                            </th>
                          )}
                          {visibleColumns.series?.visible && (
                            <th>
                              <span>{t(visibleColumns.series.label)}</span>
                            </th>
                          )}
                          {visibleColumns.version?.visible && (
                            <th>
                              <span>{t(visibleColumns.version.label)}</span>
                            </th>
                          )}
                          {visibleColumns.model?.visible && (
                            <th>
                              <span>{t(visibleColumns.model.label)}</span>
                            </th>
                          )}
                          {visibleColumns.year?.visible && (
                            <th>
                              <span>{t(visibleColumns.year.label)}</span>
                            </th>
                          )}
                          {visibleColumns.mileage?.visible && (
                            <th>
                              <span>{t(visibleColumns.mileage.label)}</span>
                            </th>
                          )}
                          {visibleColumns.type?.visible && (
                            <th>
                              <span>{t(visibleColumns.type.label)}</span>
                            </th>
                          )}
                          {visibleColumns.vin?.visible && (
                            <th>
                              <span>{t(visibleColumns.vin.label)}</span>
                            </th>
                          )}
                          {visibleColumns.manufacturer?.visible && (
                            <th>
                              <span>
                                {t(visibleColumns.manufacturer.label)}
                              </span>
                            </th>
                          )}
                          {visibleColumns.hardware?.visible && (
                            <th>
                              <span>{t(visibleColumns.hardware.label)}</span>
                            </th>
                          )}
                          {visibleColumns.transmission?.visible && (
                            <th>
                              <span>
                                {t(visibleColumns.transmission.label)}
                              </span>
                            </th>
                          )}
                          {visibleColumns.software?.visible && (
                            <th>
                              <span>{t(visibleColumns.software.label)}</span>
                            </th>
                          )}
                          {visibleColumns.read_hardware?.visible && (
                            <th>
                              <span>
                                {t(visibleColumns.read_hardware.label)}
                              </span>
                            </th>
                          )}

                          {visibleColumns.total_excl_tax?.visible && (
                            <th>
                              <span>
                                {t(visibleColumns.total_excl_tax.label)}
                              </span>
                            </th>
                          )}

                          {visibleColumns.total_incl_tax?.visible && (
                            <th>
                              <span>
                                {t(visibleColumns.total_incl_tax.label)}
                              </span>
                            </th>
                          )}

                          {visibleColumns.order_paid?.visible && (
                            <th>
                              <span>{t(visibleColumns.order_paid.label)}</span>
                            </th>
                          )}

                          {visibleColumns.paypal_error?.visible && (
                            <th>
                              <span>
                                {t(visibleColumns.paypal_error.label)}
                              </span>
                            </th>
                          )}
                          {visibleColumns.is_auto_tuned?.visible && (
                            <th>
                              <span>
                                {t(visibleColumns.is_auto_tuned.label)}
                              </span>
                            </th>
                          )}

                          {visibleColumns.actions?.visible && (
                            <th className="right-side">
                              <span>{t("common.actions")}</span>
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={15} style={{ textAlign: "center" }}>
                              {t("common.loading")}...
                            </td>
                          </tr>
                        ) : orders?.length > 0 ? (
                          orders.map((order) => (
                            <tr key={order.id}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedIds.includes(order.id)}
                                  onChange={(e) =>
                                    handleCheckboxChange(e, order.id)
                                  }
                                />
                              </td>
                              {visibleColumns.date?.visible && (
                                <td>{order.created_at}</td>
                              )}

                              {visibleColumns.id?.visible && (
                                <td>{order.order_key}</td>
                              )}

                              {visibleColumns.status?.visible && (
                                <td>
                                  <button
                                    className={
                                      statusMap[order.status]?.className
                                    }
                                  >
                                    {order.status == 3 &&
                                    order.tune_reference != null
                                      ? t(statusMap[order.status]?.labelKey) +
                                        " " +
                                        "AT"
                                      : t(
                                          statusMap[order.status]?.labelKey ||
                                            "order.status_unknown"
                                        )}
                                  </button>
                                </td>
                              )}

                              {visibleColumns.name?.visible && (
                                <td>{order.customer.name}</td>
                              )}
                              {visibleColumns.email?.visible && (
                                <td>{order.customer.email}</td>
                              )}
                              {visibleColumns.company?.visible && (
                                <td>{order.customer.company}</td>
                              )}

                              {visibleColumns.vehicle?.visible && (
                                <td>{order.vehicle_type}</td>
                              )}

                              {visibleColumns.vehicle_manufacturer?.visible && (
                                <td>{order.vehicle_manufacturer || ""}</td>
                              )}

                              {visibleColumns.stage?.visible && (
                                <td>{order.stage || ""}</td>
                              )}

                              {visibleColumns.series?.visible && (
                                <td>{order.series || ""}</td>
                              )}

                              {visibleColumns.version?.visible && (
                                <td>{order.version || ""}</td>
                              )}

                              {visibleColumns.model?.visible && (
                                <td>{order.model || ""}</td>
                              )}

                              {visibleColumns.year?.visible && (
                                <td>{order.model_year || ""}</td>
                              )}

                              {visibleColumns.mileage?.visible && (
                                <td>{order.mileage || ""}</td>
                              )}

                              {visibleColumns.type?.visible && (
                                <td>{order.engine_type || ""}</td>
                              )}

                              {visibleColumns.vin?.visible && (
                                <td>{order.vin || ""}</td>
                              )}

                              {visibleColumns.manufacturer?.visible && (
                                <td>{order.ecu_manufacturer || ""}</td>
                              )}

                              {visibleColumns.hardware?.visible && (
                                <td>{order.hardware || ""}</td>
                              )}

                              {visibleColumns.transmission?.visible && (
                                <td>{order.transmission || ""}</td>
                              )}

                              {visibleColumns.software?.visible && (
                                <td>{order.software || ""}</td>
                              )}

                              {visibleColumns.read_hardware?.visible && (
                                <td>{order.read_hardware || ""}</td>
                              )}

                              {visibleColumns.total_excl_tax?.visible && (
                                <td>{order.total_exc_price}</td>
                              )}

                              {visibleColumns.total_incl_tax?.visible && (
                                <td>{order.total_inc_price}</td>
                              )}

                              {visibleColumns.vat?.visible && (
                                <td>{order.vat}</td>
                              )}

                              {visibleColumns.order_paid?.visible && (
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={!!order.payment_status}
                                    disabled
                                  />
                                </td>
                              )}
                              {visibleColumns.paypal_error?.visible && (
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={!!order.is_paypal_error}
                                    disabled
                                  />
                                </td>
                              )}
                              {visibleColumns.is_auto_tuned?.visible && (
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={!!order.is_auto_tuned}
                                    disabled
                                  />
                                </td>
                              )}
                              {visibleColumns.actions?.visible && (
                                <td className="actionWidth2">
                                  <Link
                                    to={`/admin/orders/${order.id}`}
                                    className="viewBtn"
                                  >
                                    {t("common.view")}
                                  </Link>
                                  <button
                                    className="trashBtn"
                                    onClick={() => {
                                      openDeleteModal(order.id);
                                    }}
                                  >
                                    {t("common.delete")}
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={11} style={{ textAlign: "center" }}>
                              No records found.
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
                  <Modal
                    open={deleteModalOpen}
                    onClose={() => {
                      setDeleteModalOpen(false);
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
                        <p>{t("order.delete_single_confirm")}</p>
                        <ul className="signup-form-list">
                          <li>
                            <div className="modal-btn-group">
                              <button
                                type="button"
                                className="black-btn"
                                disabled={deleteLoading}
                                style={{
                                  cursor: deleteLoading
                                    ? "not-allowed"
                                    : "pointer",
                                  opacity: deleteLoading ? "0.5" : "1",
                                  width: "94px",
                                  justifyContent: "center",
                                }}
                                onClick={confirmDelete}
                              >
                                {deleteLoading ? (
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
                                onClick={closeDeleteModal}
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
              )}

              {activeTab === "points" && (
                <div className="resellerTab pointTab">
                  <div className="resellerTable">
                    <table className="custom-data-table">
                      <thead>
                        <tr>
                          {/* <th>
                            <input type="checkbox" />
                          </th> */}
                          <th>
                            ID
                            {/* <img src={DropIcon} alt="" className="dropBtn" /> */}
                          </th>
                          <th
                            onClick={() => handlePointsSort("created_at")}
                            // className={`sortable ${
                            //   sortBy === "created_at" ? sortOrder : ""
                            // }`}
                          >
                            Date & Time{" "}
                          </th>
                          <th>No. points </th>
                          <th>Total (Excl. Tax) </th>
                          <th>Total (VAT) </th>
                          <th>Total (Incl. Tax) </th>
                          {/* <th>
                            Order Paid{" "}
                          </th> */}
                          {/* <th>
                            Actions{" "}
                          </th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {pointsArr?.length > 0 ? (
                          pointsArr?.map((item, index) => {
                            return (
                              <tr key={index}>
                                <td>{item?.order_key}</td>
                                <td>{item?.date}</td>
                                <td>{item?.tokens}</td>
                                <td>{item?.vat}€</td>
                                <td>{item?.exc_total}€</td>
                                <td>{item?.total}€</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={8} style={{ textAlign: "center" }}>
                              No record found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResellerCustomerDetails;
