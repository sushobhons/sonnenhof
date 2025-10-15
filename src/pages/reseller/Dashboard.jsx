import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../auth/useAuth";
import ResellerHeader from "../../layouts/ResellerHeader";
import ResellerSidebar from "../../layouts/ResellerSidebar";
import TableFooter from "../../layouts/TableFooter";
import API from "../../api/axios";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import CountUp from "react-countup";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import { barsIcon, warningImg } from "@/assets/images";

// import images
import completeProgressIcon from "../../assets/images/complete-progress-icon.svg";
import inProgressIcon from "../../assets/images/in-progress-icon.png";
import cancelProgressIcon from "../../assets/images/cancel-progress-icon.svg";
import { IMAGE_URL } from "../../utils/apiUrl";

// Sample data

const parseDate = (str) => {
  const [day, monStr, year] = str.split(" ");
  const month = new Date(`${monStr} 1, 2000`).getMonth();
  return new Date(year, month, parseInt(day), 0, 0, 0);
};

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const ResellerDashboard = () => {
  const [countDetails, setCountDetails] = useState();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
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
  const [resellerId, setResellerId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const { user } = useAuth();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);

  const statusMap = {
    1: { labelKey: "order.status_waiting", className: "waiting" },
    2: { labelKey: "order.status_pending", className: "waiting" },
    3: { labelKey: "order.status_completed", className: "completed" },
    4: { labelKey: "order.status_cancelled", className: "cancelled" },
  };

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

  const handleColumnSorting = () => {
    setShowColumnPopover(!showColumnPopover);
  };

  // Include this in your API request (if needed)
  const getOrders = async () => {
    try {
      setLoading(true);
      const resellerId = user?.reseller_id;
      const response = await API.get(`/resellers/${resellerId}/orders`, {
        params: {
          status,
          from_date: fromDate,
          to_date: toDate,
          unpaid_only: showUnpaidOnly ? 1 : 0,
          page,
          perPage,
          sortBy,
          sortOrder,
        },
      });
      console.log(response.data.data);
      setOrders(response.data.data);
      setAllOrders(response.data.data);
      setTotalPages(response.data.last_page);
      setTotalRecords(response.data.total);
    } catch (error) {
      console.error("Error fetching orders", error);
    } finally {
      setLoading(false);
    }
  };

  const sortFilterData = (term, purpose) => {
    if (purpose == "status") {
      const lowerSearch = String(term).toLowerCase();
      const filtered = allOrders.filter((order) => {
        return String(order.status).includes(lowerSearch);
      });
      setOrders(filtered);
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

  // barchart data start
  const [activeTimeFilter, setActiveTimeFilter] = useState("");
  const [monthlyChartData, setMonthlyChartData] = useState([]);
  const [weeklyChartData, setWeeklyChartData] = useState([]);
  const [yearlyChartData, setYearlyChartData] = useState([]);
  const [dashboardData, setDashboardData] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [personalizeData, setPersonalizeData] = useState({
    logo: "",
    logoName: "",
    company: "",
    bgColor: "#0F0F0F",
    profileImage: "",
  });

  const getMonthlyData = () => [
    { label: "Jan", value: 1420, percentChange: 100 },
    { label: "Feb", value: 550, percentChange: 85 },
    { label: "Mar", value: 780, percentChange: 85 },
    { label: "Apr", value: 670, percentChange: 85 },
    { label: "May", value: 420, percentChange: 85 },
    { label: "Jun", value: 580, percentChange: 85 },
    { label: "Jul", value: 680, percentChange: 85 },
    { label: "Aug", value: 1220, percentChange: 85 },
    { label: "Sep", value: 590, percentChange: 85 },
    { label: "Oct", value: 480, percentChange: 85 },
    { label: "Nov", value: 620, percentChange: 85 },
    { label: "Dec", value: 730, percentChange: 85 },
  ];

  const getWeeklyData = () => [
    { label: "W1", value: 150, percentChange: 50 },
    { label: "W2", value: 180, percentChange: 50 },
    { label: "W3", value: 270, percentChange: 50 },
    { label: "W4", value: 190, percentChange: 50 },
  ];

  const getYearlyData = () => [
    { label: "2020", value: 3200, percentChange: 74 },
    { label: "2021", value: 4100, percentChange: 74 },
    { label: "2022", value: 5300, percentChange: 74 },
    { label: "2023", value: 7200, percentChange: 74 },
    { label: "2024", value: 12500, percentChange: 74 },
    { label: "2025", value: 12500, percentChange: 74 },
  ];

  const handleSort = (field) => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(order);
    setSortBy(field);

    const sorted = [...orders].sort((a, b) => {
      if (field === "created_at") {
        return order === "asc"
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      }

      if (field === "customer_email") {
        const emailA = a.customer?.email?.toLowerCase() || "";
        const emailB = b.customer?.email?.toLowerCase() || "";
        return order === "asc"
          ? emailA.localeCompare(emailB)
          : emailB.localeCompare(emailA);
        console.log(nameA, nameB);
      }

      if (field === "reseller_name") {
        const nameA = a.reseller?.name?.toLowerCase() || "";
        const nameB = b.reseller?.name?.toLowerCase() || "";
        return order === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }

      return 0;
    });

    setOrders(sorted);
  };

  const generateMonthlyDataFromAPI = (monthlyChart) => {
    return Object.entries(monthlyChart).map(([month, value]) => ({
      label: month,
      value,
      percentChange: value,
    }));
  };

  const fetchCounts = async () => {
    console.log(t);
    try {
      const response = await API.get(`reseller/dashboard`);
      if (response.data.success) {
        const data = response.data.data;
        setCountDetails(data);
        setActiveTimeFilter("Monthly");
        const monthlyChart = data.charts?.monthly_chart || {};
        const weeklyChart = data.charts?.weekly_chart || {};
        const yearlyChart = data.charts?.yearly_chart || {};

        const monthlyData = generateMonthlyDataFromAPI(monthlyChart);
        const weeklyData = generateMonthlyDataFromAPI(weeklyChart);
        const yearlyData = generateMonthlyDataFromAPI(yearlyChart);

        setMonthlyChartData(monthlyData);
        setWeeklyChartData(weeklyData);
        setYearlyChartData(yearlyData);
      } else {
        setCountDetails();
      }
    } catch (error) {
      console.error("Error fetching orders", error);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = allOrders.filter((order) => {
      return (
        order.order_key.toLowerCase().includes(lowerSearch) ||
        order.customer.email.toLowerCase().includes(lowerSearch) ||
        order.reseller.name.toLowerCase().includes(lowerSearch) ||
        String(order.total_exc_price).includes(lowerSearch) ||
        String(order.total_inc_price).includes(lowerSearch)
      );
    });

    setOrders(filtered);
  }, [searchTerm, allOrders]);

  useEffect(() => {
    let data;
    switch (activeTimeFilter) {
      case "Weekly":
        // data = getWeeklyData();
        data = weeklyChartData;
        break;
      case "Yearly":
        // data = getYearlyData();
        data = yearlyChartData;
        break;
      case "Monthly":
      default:
        // data = getMonthlyData();
        data = monthlyChartData;
        break;
    }
    setDashboardData(data);
  }, [activeTimeFilter]);

  useEffect(() => {
    getOrders();
    console.log("Reseller Dashboard mounted");
  }, [search, fromDate, toDate, page, perPage, sortBy, sortOrder]);

  const maxValue = Math.max(...dashboardData.map((item) => item.value));

  return (
    <div className="fullWidth">
      <div className="main">
        <ResellerSidebar />
        <div className="container">
          <ResellerHeader pageTitle={t("sidebar.dashboard")} />
          <div className="mainInnerDiv">
            <div className="dashTop">
              {/* <h2>Welcome, to dashboard</h2> */}
              <h2>{t("dashboard.welcome.message")}</h2>
            </div>
            <div className="dashboard-top-card-box-section">
              <div className="dashboard-top-card-box">
                <h4>
                  {/* <img src={completeProgressIcon} alt="" /> Completed Orders */}
                  <img src={completeProgressIcon} alt="" />{" "}
                  {t("dashboard.complete.orders")}
                </h4>
                <h3>
                  <CountUp end={countDetails?.completed_orders} />
                </h3>
                {/* <p>Last month analytics</p> */}
                <p>{t("dashboard.last.month.analysis")}</p>
              </div>
              <div className="dashboard-top-card-box">
                <h4>
                  <img src={inProgressIcon} alt="" />{" "}
                  {t("dashboard.inprogress.orders")}
                </h4>
                <h3>
                  <CountUp end={countDetails?.in_progress_orders} />
                </h3>
                <p>{t("dashboard.last.month.analysis")}</p>
              </div>
              <div className="dashboard-top-card-box">
                <h4>
                  <img src={cancelProgressIcon} alt="" />{" "}
                  {t("dashboard.canceled.orders")}
                </h4>
                <h3>
                  <CountUp end={countDetails?.cancelled_orders} />
                </h3>
                <p>{t("dashboard.last.month.analysis")}</p>
              </div>
            </div>
            <div className="dashboard-mid-card-box-section">
              <div className="dashboard-mid-card-box">
                {/*  Barchart Start */}
                <div className="dashboard-barchart">
                  {activeTimeFilter && (
                    <div className="barchart-header">
                      <div>
                        <h3>{t("dashboard.overview")}</h3>
                        <p>
                          {activeTimeFilter} {t("dashboard.earnings")}
                        </p>
                      </div>
                      <select
                        value={activeTimeFilter}
                        onChange={(e) => setActiveTimeFilter(e.target.value)}
                      >
                        <option value="Weekly">
                          {t("dashboard.filter.weekly")}
                        </option>
                        <option value="Monthly">
                          {t("dashboard.filter.monthly")}
                        </option>
                        <option value="Yearly">
                          {t("dashboard.filter.yearly")}
                        </option>
                      </select>
                    </div>
                  )}
                  <div className="chart-container">
                    {dashboardData.map((item, index) => {
                      const height = (item.value / maxValue) * 100;
                      const isHighlighted =
                        item.percentChange &&
                        Math.abs(item.percentChange) >= 20;
                      return (
                        <div
                          className="bar-group"
                          key={index}
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        >
                          <div
                            className={`bar ${
                              hoveredIndex === index ? "highlight" : ""
                            }`}
                            style={{ height: `${height}%` }}
                          >
                            {hoveredIndex === index && (
                              <div className="tooltip">
                                {item.percentChange ? (
                                  <>
                                    {item.percentChange > 0 ? "↑" : "↓"}{" "}
                                    {item.percentChange}%
                                  </>
                                ) : (
                                  `${t("dashboard.value")}: ${item.value}`
                                )}
                              </div>
                            )}
                          </div>
                          <div className="bar-label">{item.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Barchart End  */}
              </div>
              {/* <div className="dashboard-mid-card-box right-tab-card-box">
                    <Box sx={{ width: "100%" }}>
                      <TabContext value={value}>
                        <Box
                          sx={{ borderBottom: 1, borderColor: "divider" }}
                          className="admin-tab-box"
                        >
                          <TabList
                            onChange={handleChange}
                            aria-label="lab API tabs example"
                            className="admin-tab-list"
                          >
                            <Tab label="Resellers" value="Resellers1" />
                            <Tab label="Administrators" value="Administrators2" />
                          </TabList>
                        </Box>
                        <TabPanel value="Resellers1" className="admin-tab-panel">
                          <ul className="resellers-tab-list">
                            <li>
                              <div className="left-tab-content-group">
                                <img
                                  src={avatarImg1}
                                  alt=""
                                  className="avatarImg"
                                />
                                <div className="tab-titlecontent-box">
                                  <h3>Order pros</h3>
                                  <p>Login: yann</p>
                                </div>
                              </div>
                              <div className="right-tab-content-group">
                                <button className="ellipse-btn">
                                  <img src={ellipseIcon} alt="" />
                                </button>
                                <div className="ellipse-dropdown"></div>
                              </div>
                            </li>
                          </ul>
                        </TabPanel>
                        <TabPanel
                          value="Administrators2"
                          className="admin-tab-panel"
                        >
                          Item Two
                        </TabPanel>
                      </TabContext>
                    </Box>
                  </div> */}
            </div>
            {/* Data Table Start */}
            <div className="dashboard-datatable">
              <div className="datatable-header-group">
                <h3>{t("dashboard.customer.orders")}</h3>
              </div>
              <div className="resellerFilter">
                <div className="searchFilter">
                  <div className="salesDrop">
                    <select
                      value={status}
                      // onChange={(e) => setStatus(e.target.value)}
                      onChange={(e) => {
                        setStatus(e.target.value);
                        sortFilterData(e.target.value, "status");
                      }}
                    >
                      <option value="">{t("order.status")}</option>
                      <option value="1">{t("order.status_waiting")}</option>
                      <option value="2">{t("order.status_pending")}</option>
                      <option value="3">{t("order.status_completed")}</option>
                      <option value="4">{t("order.status_cancelled")}</option>
                    </select>
                    {/* <select
                        value={resellerId}
                        onChange={(e) => setResellerId(e.target.value)}
                      > */}
                    {/* <option value="">{t("order.reseller")}</option> */}
                    {/* {resellerOptions.map((reseller) => (
                          <option key={reseller.id} value={reseller.id}>
                            {reseller.name}
                          </option>
                        ))} */}
                    {/* </select> */}
                  </div>
                  <div className="search-group">
                    <input
                      type="text"
                      placeholder={t("common.search_here")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-control"
                    />
                  </div>
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
                    </div>
                    <div className="unpaidOrder">
                      {t("order.show_unpaid")}{" "}
                      <input
                        type="checkbox"
                        checked={showUnpaidOnly}
                        onChange={(e) => setShowUnpaidOnly(e.target.checked)}
                      />
                    </div> */}
                </div>

                <div className="sortFilter">
                  {/*  <button
                      className="deleteBtn deactivateBtn"
                      onClick={handleDelete}
                    >
                      {t("common.delete")}
                    </button>
                    <button className="pdfBtn">
                      <img src={PdfIcon} alt={t("common.pdf")} />
                    </button>
                    <button className="fileBtn">
                      <img src={FileIcon} alt={t("common.file")} />
                    </button>*/}
                  <button className="print-btn" onClick={handleColumnSorting}>
                    <img src={barsIcon} alt="column" />
                  </button>
                  {showColumnPopover && (
                    <div className="column-popover">
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
                </div>
              </div>

              <div className="resellerTable">
                <table className="custom-data-table">
                  <thead>
                    <tr>
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
                        <th onClick={() => handleSort("vehicle_manufacturer")}>
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
                          <span>{t(visibleColumns.manufacturer.label)}</span>
                        </th>
                      )}
                      {visibleColumns.hardware?.visible && (
                        <th>
                          <span>{t(visibleColumns.hardware.label)}</span>
                        </th>
                      )}
                      {visibleColumns.transmission?.visible && (
                        <th>
                          <span>{t(visibleColumns.transmission.label)}</span>
                        </th>
                      )}
                      {visibleColumns.software?.visible && (
                        <th>
                          <span>{t(visibleColumns.software.label)}</span>
                        </th>
                      )}
                      {visibleColumns.read_hardware?.visible && (
                        <th>
                          <span>{t(visibleColumns.read_hardware.label)}</span>
                        </th>
                      )}

                      {visibleColumns.total_excl_tax?.visible && (
                        <th>
                          <span>{t(visibleColumns.total_excl_tax.label)}</span>
                        </th>
                      )}

                      {visibleColumns.total_incl_tax?.visible && (
                        <th>
                          <span>{t(visibleColumns.total_incl_tax.label)}</span>
                        </th>
                      )}

                      {visibleColumns.order_paid?.visible && (
                        <th>
                          <span>{t(visibleColumns.order_paid.label)}</span>
                        </th>
                      )}

                      {visibleColumns.paypal_error?.visible && (
                        <th>
                          <span>{t(visibleColumns.paypal_error.label)}</span>
                        </th>
                      )}
                      {visibleColumns.is_auto_tuned?.visible && (
                        <th>
                          <span>{t(visibleColumns.is_auto_tuned.label)}</span>
                        </th>
                      )}

                      <th className="right-side">
                        <span>{t("common.actions")}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={11} style={{ textAlign: "center" }}>
                          {t("common.loading")}...
                        </td>
                      </tr>
                    ) : orders?.length > 0 ? (
                      orders.map((order) => (
                        <tr key={order.id}>
                          {visibleColumns.date?.visible && (
                            <td>{order.created_at}</td>
                          )}

                          {visibleColumns.id?.visible && (
                            <td>{order.order_key}</td>
                          )}

                          {visibleColumns.status?.visible && (
                            <td>
                              <button
                                className={statusMap[order.status]?.className}
                              >
                                {t(
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

                          {visibleColumns.vat?.visible && <td>{order.vat}</td>}

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
                          <td className="actionWidth2">
                            <Link
                              to={`/reseller/orders/${order.id}`}
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
            </div>
            {/* Data Table Start */}
          </div>
        </div>
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
                        cursor: deleteLoading ? "not-allowed" : "pointer",
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
    </div>
  );
};

export default ResellerDashboard;
