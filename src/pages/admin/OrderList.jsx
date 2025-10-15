import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../../layouts/AdminSidebar";
import Header from "../../layouts/AdminHeader";
import TableFooter from "../../layouts/TableFooter";
import API from "../../api/axios";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { exportToCSV, printData } from "@/utils/exportUtils";
import { Modal, Box } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import {
  PdfIcon,
  FileIcon,
  barsIcon,
  fullscreenIcon,
  exitFullscreenIcon,
  DropIcon,
  warningImg,
} from "@/assets/images";

import i18n from "../../i18n";

const AdminSalesOrders = () => {
  const popoverRef = useRef(null);
  const getInitialPerPage = () => {
    const height = window.innerHeight;
    if (height >= 1440) return 100;
    else if (height >= 1080) return 50;
    else if (height >= 800) return 25;
    else return 10;
  };

  const [perPage, setPerPage] = useState(getInitialPerPage());
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [pdfDatas, setPdfDatas] = useState([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(1);
  const [status, setStatus] = useState("");
  const [resellerId, setResellerId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedIds, setSelectedIds] = useState([]);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { t } = useTranslation();

  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showColumnPopover, setShowColumnPopover] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    date: { visible: true, label: "common.date" },
    id: { visible: true, label: "common.id" },
    status: { visible: true, label: "common.status" },
    reseller: { visible: true, label: "common.reseller" },
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

  const statusMap = {
    1: { labelKey: "order.status_waiting", className: "waiting" },
    2: { labelKey: "order.status_pending", className: "waiting" },
    3: { labelKey: "order.status_completed", className: "completed" },
    4: { labelKey: "order.status_cancelled", className: "cancelled" },
  };

  // Include this in your API request (if needed)
  const getOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get("/orders", {
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

      if (response.data.data.length > 0) {
        setOrders(response.data.data);
        setAllOrders(response.data.data);
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
      }

      setTotalPages(response.data.last_page);
      setTotalRecords(response.data.total);
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

  const handlePrint = async () => {
    printData(
      pdfDatas,
      [
        { key: "created_at", label: "Date & Time" },
        { key: "order_key", label: "ID" },
        { key: "reseller_name", label: "Reseller" },
        { key: "customer_email", label: "Customer Email" },
        { key: "total_exc_price", label: "Total (Excl. Tax)" },
        { key: "total_inc_price", label: "Total (Incl. Tax)" },
      ],
      // t("sidebar.configuration_vehicle")
      "SalesOrders"
    );
  };

  const handleExportCSV = async () => {
    exportToCSV(
      orders,
      // `TuningFile-${t("sidebar.configuration_vehicle")}`,
      `TuningFile-Sales-Orders`,
      (item) => ({
        "Vehicle Type": item.created_at,
        "Vehicle Manufacturer": item.order_key,
        Reseller: item.reseller.name,
        "Customer Email": item.customer.email,
        "Total (Excl. Tax)": item.total_exc_price,
        "Total (Incl. Tax)": item.total_inc_price,
      })
    );
  };

  const handleSort = (field) => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(order);
    setSortBy(field);

    const sorted = [...orders].sort((a, b) => {
      if (field === "date") {
        return order === "asc"
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      }

      if (field === "customer_email") {
        return order === "asc"
          ? a.customer.email.localeCompare(b.customer.email)
          : b.customer.email.localeCompare(a.customer.email);
      }

      if (field === "reseller_name") {
        return order === "asc"
          ? a.reseller.name.localeCompare(b.reseller.name)
          : b.reseller.name.localeCompare(a.reseller.name);
      }

      return 0;
    });

    setOrders(sorted);
  };

  const sortFilterData = (term, purpose) => {
    console.log(term);
    if (purpose == "status") {
      const lowerSearch = String(term).toLowerCase();
      const filtered = allOrders.filter((order) => {
        return String(order.status).includes(lowerSearch);
      });
      console.log(filtered);
      setOrders(filtered);
    }
  };

  useEffect(() => {
    getOrders();
  }, [search, fromDate, toDate, page, perPage, sortBy, sortOrder]);

  useEffect(() => {
    const updatePerPage = () => {
      const height = window.innerHeight;
      if (height >= 1440) setPerPage(100);
      else if (height >= 1080) setPerPage(50);
      else if (height >= 800) setPerPage(25);
      else setPerPage(10);
    };

    updatePerPage();
    window.addEventListener("resize", updatePerPage);
    return () => window.removeEventListener("resize", updatePerPage);
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

  const handleToggleFullscreen = () => {
    const elem = document.getElementById("table-container");
    if (!document.fullscreenElement) {
      if (elem?.requestFullscreen) {
        elem.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  const handleColumnSorting = () => {
    setShowColumnPopover(!showColumnPopover);
  };

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
        <AdminSidebar />
        <div className="container">
          <Header pageTitle={t("sidebar.customer_orders")} />
          <div
            id="table-container"
            className={`mainInnerDiv ${
              isFullscreen ? "fullscreen-active" : ""
            }`}
          >
            {/* <div className="dashTop containerSearch"> */}
            {/* <h2>Customer Orders</h2> */}

            {/* </div> */}

            <div className="resellerFilter">
              <div className="searchFilter">
                <div className="salesDrop">
                  <select
                    value={status}
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
                  >
                    <option value="">{t("order.reseller")}</option> */}
                  {/* {resellerOptions.map((reseller) => (
                      <option key={reseller.id} value={reseller.id}>
                        {reseller.name}
                      </option>
                    ))} */}
                  {/* </select> */}
                </div>
                <div className="searchFilter">
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
                </div> */}
                {/* <div className="unpaidOrder">
                  {t("order.show_unpaid")}{" "}
                  <input
                    type="checkbox"
                    checked={showUnpaidOnly}
                    onChange={(e) => setShowUnpaidOnly(e.target.checked)}
                  />
                </div> */}
              </div>

              <div className="sortFilter">
                <button
                  className="paid-order deleteBtn"
                  // className="deleteBtn"
                  disabled={selectedIds.length === 0}
                  onClick={() => markOrderAsPaid()}
                >
                  {t("order.mark_paid")}
                </button>
                <button className="print-btn" onClick={handleColumnSorting}>
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
                <button
                  className="fullscreen-btn"
                  onClick={handleToggleFullscreen}
                >
                  <img
                    src={isFullscreen ? exitFullscreenIcon : fullscreenIcon}
                    alt="Toggle Fullscreen"
                  />
                </button>
              </div>
            </div>

            <div className="resellerTable">
              <table className="custom-data-table">
                <table
                  className={
                    i18n.language == "en"
                      ? "custom-data-table"
                      : "custom-data-table-fr"
                  }
                ></table>
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

                    {visibleColumns.reseller?.visible && (
                      <th>
                        <span>{t(visibleColumns.reseller.label)}</span>
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
                            onChange={(e) => handleCheckboxChange(e, order.id)}
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
                              className={statusMap[order.status]?.className}
                            >
                              {t(
                                statusMap[order.status]?.labelKey ||
                                  "order.status_unknown"
                              )}
                            </button>
                          </td>
                        )}
                        {visibleColumns.reseller?.visible && (
                          <td>{order.reseller.name}</td>
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
          </div>
        </div>
      </div>
      {/* --Delete Popup-- */}
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
  );
};

export default AdminSalesOrders;
