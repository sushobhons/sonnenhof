import { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ResellerSidebar from "../../layouts/ResellerSidebar";
import ResellerHeader from "../../layouts/ResellerHeader";
import API from "../../api/axios";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { downloadFile, getParsedOtherServices } from "../../utils/commonFunc";
import CircularProgress from "@mui/material/CircularProgress";
import { Skeleton, Box } from "@mui/material";

import PdfIcon from "../../assets/images/pdf-icon.svg";
import FileIcon from "../../assets/images/file-icon.svg";
import DropIcon from "../../assets/images/drop-icon.svg";
import BackIcon from "../../assets/images/back-btn.svg";
import UploadImg from "../../assets/images/upload-img.svg";
import CrossIcon from "../../assets/images/cross-icon.svg";
import ConfirmationIcon from "../../assets/images/confirmation-icon.svg";
import { IMAGE_URL } from "../../utils/apiUrl";

function ResellerOrderDetails() {
  const [invoicePdf, setInvoicePdf] = useState("");
  const [invoice, setInvoice] = useState({
    method: "",
    url: "",
  });
  const fileInputRef = useRef(null);
  const modifiedRef = useRef(null);
  const [showAfterServicePopup, setShowAfterServicePopup] = useState(false);
  const [selectedAfterService, setSelectedAfterService] = useState(null);
  const [count, setCount] = useState();
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders"); // default tab

  const imageBaseUrl = `${import.meta.env.IMAGE_BASE_URL}`;

  const statusMap = {
    1: { labelKey: "order.status_waiting", className: "waiting" },
    2: { labelKey: "order.status_pending", className: "pending" },
    3: { labelKey: "order.status_completed", className: "completed" },
    4: { labelKey: "order.status_cancelled", className: "cancelled" },
  };
  const [status, setStatus] = useState("");
  const [customerDetails, setCustomerDetails] = useState([]);
  const [resellerDetails, setResellerDetails] = useState([]);
  const [iniFile, setIniFile] = useState(false);
  const [orderDetails, setOrderDetails] = useState();
  const [afterServices, setAfterServices] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [fileUploading, setFileUploading] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [showPopup2, setShowPopup2] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const [selectedServiceFile, setSelectedServiceFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const getOrderDetails = async () => {
    //setIsSubmitting(true);
    try {
      const response = await API.get(`/orders/${id}`);
      const order = response.data.data;

      setCustomerDetails(order.customer);

      setOrderDetails(order);
      setInvoice((prev) => ({
        ...prev,
        method: response.data.payment_method,
        url: response.data.invoice,
      }));
      const sortedServices = [...order.after_services].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setAfterServices(sortedServices);
      let ini = response.data.data?.order_files.find(
        (item) => item.file_type === "ini"
      );
      if (ini) {
        setIniFile(true);
      } else {
        setIniFile(false);
      }

      if (order?.order_files?.length > 0) {
        let count = 0;
        order.order_files.forEach((item) => {
          if (item?.file_type === "modified") {
            count += 1;
          }
        });
        setCount(count);
      } else {
        setCount(0);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("common.fetch.error"), {
        theme: "dark",
        autoClose: 2000,
      });
    } finally {
      //setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    try {
      const response = await API.post("/orders/status-change", {
        order_id: orderDetails.id,
        status: newStatus,
      });

      toast.success("Order status changed", {
        theme: "dark",
        autoClose: 2000,
      });

      if (parseInt(newStatus) === 3 && response.data.invoice_pdf) {
        setInvoicePdf(response.data.invoice_pdf);
      }

      // Optional: refresh data
      getOrderDetails();
    } catch (error) {
      toast.error(
        error.response?.data?.message || t("order.status_update_error"),
        {
          theme: "dark",
          autoClose: 2000,
        }
      );
    }
  };

  const markOrderAsPaid = async (ids = []) => {
    const prevStatus = orderDetails.payment_status;

    try {
      await API.post("/orders/mark-paid", {
        ids,
      });

      toast.success("Marked as Paid", {
        theme: "dark",
        autoClose: 2000,
      });
    } catch (error) {
      setOrderDetails((prev) => ({
        ...prev,
        payment_status: prevStatus,
      }));
      toast.error(
        error.response?.data?.message || t("order.status_update_error"),
        {
          theme: "dark",
          autoClose: 2000,
        }
      );
    }
  };

  const handleSort = (field) => {
    let order = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(order);
    setSortBy(field);

    const sorted = [...afterServices].sort((a, b) => {
      if (field === "date") {
        return order === "asc"
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      }
      return 0;
    });

    setAfterServices(sorted);
  };

  const uploadModifiedFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("order_id", id);

    try {
      setFileUploading(true);
      const responseData = await API.post(`/orders/modified-file`, formData, {
        headers: {
          "Content-Type": "multipart/formdata",
        },
      });

      if (responseData.data.success) {
        toast.success("File uploaded successfully!", { autoClose: 2000 });
        await getOrderDetails();
      } else {
        toast.error(responseData.message || "File upload failed.", {
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setFileUploading(false);
    }
  };

  useEffect(() => {
    getOrderDetails();
  }, []);

  const closePopup = () => {
    setShowPopup(false);
  };

  const closeAfterServicePopup = () => {
    setShowAfterServicePopup(false);
  };

  const openAfterServicePopup = (service) => {
    setSelectedAfterService(service);
    setShowAfterServicePopup(true);
  };

  const handleRejectAfterService = async (serviceId) => {
    setIsSubmitting(true);
    try {
      const response = await API.put(`/orders/after-services/${serviceId}`, {
        status: 2, // assuming 2 = Rejected
      });

      toast.success(t("order.reject_success"), {
        theme: "dark",
        autoClose: 2000,
      });

      closeAfterServicePopup(); // Close the popup
      getOrderDetails(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || t("common.error_occurred"), {
        theme: "dark",
        autoClose: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleECUFileUpload = async (event, serviceId) => {
    if (!selectedAfterService) return;
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const status = file ? 1 : 2;
    formData.append("status", status.toString());
    setUploading(true);

    try {
      const response = await API.post(
        `/orders/after-services/${serviceId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(response.message, {
        theme: "dark",
        autoClose: 2000,
      });

      closeAfterServicePopup();
      getOrderDetails(); // refresh
    } catch (error) {
      toast.error(error.response?.data?.message || t("order.upload_failed"), {
        theme: "dark",
        autoClose: 2000,
      });
    } finally {
      setUploading(false); // End
    }
  };

  const handleServiceFileChange = (e) => {
    setSelectedServiceFile(e.target.files[0]);
  };

  const handleSubmitAfterService = async () => {
    if (!selectedAfterService) return;

    setIsSubmitting(true);
    const formData = new FormData();

    // If file uploaded → status 1 (accepted), else → status 2 (rejected)
    const status = selectedServiceFile ? 1 : 2;

    formData.append("status", status);
    if (selectedServiceFile) {
      formData.append("file", selectedServiceFile);
    }

    try {
      const response = await API.post(
        `/orders/after-services/${selectedAfterService.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(
        status === 1
          ? t("order.ecu_upload_success")
          : t("order.reject_success"),
        {
          theme: "dark",
          autoClose: 2000,
        }
      );

      setSelectedFile(null);
      closeAfterServicePopup();
      getOrderDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || t("common.error_occurred"), {
        theme: "dark",
        autoClose: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSubmit = async () => {
    if (!reason || !message.trim()) {
      toast.error("Please fill in both reason and message.");
      return;
    }

    try {
      await API.post(`/resellers/orders/${id}/cancel`, {
        reason,
        message,
      });

      toast.success("Order cancelled successfully", {
        theme: "dark",
        autoClose: 2000,
      });

      setShowPopup(false);
      setShowPopup2(true);
      setOrderDetails((prev) => ({
        ...prev,
        status: 4,
      }));
    } catch (error) {
      toast.error(
        error.response?.data?.message || t("order.status_update_error"),
        {
          theme: "dark",
          autoClose: 2000,
        }
      );
    }
  };

  const findAndDownloadFile = () => {
    const ini = orderDetails.order_files.find(
      (item) => item.file_type === "ini"
    );
    if (ini) {
      downloadFile(IMAGE_URL + ini.file, "");
    }
  };

  const modifiedFile = () => {
    modifiedRef.current.click();
  };

  const confirmRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (confirmRef.current && !confirmRef.current.contains(event.target)) {
        setShowPopup2(false);
      }
    };

    if (showPopup2) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup2]);

  return (
    <div className="fullWidth">
      <div className="main">
        <ResellerSidebar />
        <div className="container">
          <ResellerHeader pageTitle={t("sidebar.customer_orders")} />
          <div className="mainInnerDiv">
            <div className="resellerInner">
              <div className="dashTop">
                <h2 className="resellerHdn">
                  <button onClick={() => navigate(-1)} className="back-button">
                    <img src={BackIcon} alt="" />
                  </button>
                  {t("order.id")}: {orderDetails?.order_key}
                </h2>

                <div className="resellerBtns">
                  {invoice?.method == "paypal" && (
                    <button
                      className="invoiceBtn"
                      onClick={() => downloadFile(IMAGE_URL + invoice?.url)}
                    >
                      View Invoice
                    </button>
                  )}
                  <button
                    className="downloadBtn"
                    disabled={!iniFile}
                    style={{
                      opacity: !iniFile ? "0.5" : "1",
                      cursor: !iniFile ? "not-allowed" : "pointer",
                    }}
                    onClick={() => findAndDownloadFile()}
                  >
                    Download .ini file
                  </button>

                  {orderDetails?.status !== 4 && (
                    <button
                      className="cancelBtn"
                      onClick={() => setShowPopup(true)}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              <div className="resellerForm resellerOrderForm">
                <ul>
                  <li>
                    <label>{t("order.status")}</label>
                    <select
                      value={orderDetails?.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={orderDetails?.status === 4}
                    >
                      <option value="">{t("order.status")}</option>
                      <option value="1">{t("order.status_waiting")}</option>
                      <option value="2">{t("order.status_pending")}</option>
                      <option value="3">{t("order.status_completed")}</option>
                    </select>
                  </li>
                  <li>
                    <label>{t("common.email")}</label>
                    <input
                      type="text"
                      value={customerDetails?.email || ""}
                      disabled
                    />
                  </li>
                  <li>
                    <label>{t("common.phone")}</label>
                    <input
                      type="text"
                      value={customerDetails?.phone_number || ""}
                      disabled
                    />
                  </li>
                  {/* <li>
                      <label>{t("common.reseller")}</label>
                      <input
                        type="text"
                        value={resellerDetails?.email || ""}
                        disabled
                      />
                    </li> */}
                  <li>
                    <label>{t("reseller.company")}</label>
                    <input
                      type="text"
                      value={resellerDetails?.company_name || ""}
                      disabled
                    />
                  </li>
                  <li>
                    <label>{t("billing.vat")}</label>
                    <input
                      type="text"
                      value={customerDetails?.vat_number || ""}
                      disabled
                    />
                  </li>
                  <li>
                    <label>Total excl. VAT</label>
                    <input
                      type="text"
                      value={orderDetails?.total_exc_price}
                      disabled
                    />
                  </li>
                  <li>
                    <label>Total VAT</label>
                    <input type="text" value={orderDetails?.vat} disabled />
                  </li>
                  <li>
                    <label>Total incl. VAT</label>
                    <input
                      type="text"
                      value={orderDetails?.total_inc_price}
                      disabled
                    />
                  </li>
                  <li>
                    <label>Tokens used</label>
                    <input type="text" value={orderDetails?.tokens} disabled />
                  </li>
                  <li>
                    <label>Amount to be paid</label>
                    <input type="text" value="0.00" disabled />
                  </li>

                  <li
                    style={{
                      display:
                        resellerDetails?.allow_mark_cmd_paid === 1
                          ? "block"
                          : "none",
                    }}
                  >
                    <div className="checkForm">
                      <span>{t("config.order_paid")}</span>
                      <input
                        type="checkbox"
                        checked={orderDetails?.payment_status === 1}
                        onChange={() => {
                          setOrderDetails((prev) => ({
                            ...prev,
                            payment_status: 1,
                          }));
                          markOrderAsPaid([orderDetails.id]);
                        }}
                      />
                    </div>
                  </li>
                  <li>
                    <div className="checkForm">
                      <span>{t("order.paypal_error")}</span>
                      <input
                        type="checkbox"
                        checked={!!orderDetails?.is_paypal_error}
                        disabled
                      />
                    </div>
                  </li>
                  <li>
                    <div className="checkForm">
                      <span>Auto Tune</span>
                      <input
                        type="checkbox"
                        checked={!!orderDetails?.is_auto_tuned}
                        disabled
                      />
                    </div>
                  </li>
                </ul>
              </div>

              <div className="resellerNav">
                <ul>
                  <li>
                    <Link
                      className={activeTab === "orders" ? "active" : ""}
                      onClick={() => setActiveTab("orders")}
                    >
                      {t("order.information")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={activeTab === "paypal" ? "active" : ""}
                      onClick={() => setActiveTab("paypal")}
                    >
                      {t("order.paypal_information")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={activeTab === "stripe" ? "active" : ""}
                      onClick={() => setActiveTab("stripe")}
                    >
                      {t("order.stripe_information")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={activeTab === "request" ? "active" : ""}
                      onClick={() => setActiveTab("request")}
                    >
                      {t("order.requests")}
                    </Link>
                  </li>
                </ul>
              </div>

              {activeTab === "orders" && (
                <>
                  <div className="orderStatus">
                    <ul>
                      <li>
                        <h2>
                          {t("order.status")} :{" "}
                          <button
                            className={
                              statusMap[orderDetails?.status]?.className
                            }
                          >
                            {orderDetails?.status === 3 &&
                            orderDetails?.tune_reference !== null
                              ? `${t(statusMap[3]?.labelKey)} AT`
                              : t(
                                  statusMap[orderDetails?.status]?.labelKey ||
                                    "order.status_unknown"
                                )}
                          </button>
                        </h2>
                      </li>
                      <li>
                        <h2>
                          {t("order.date")} : {orderDetails?.created_at}
                        </h2>
                      </li>
                      <li>
                        <h2>
                          Total Price/Tokens : {orderDetails?.tokens} tokens
                        </h2>
                      </li>
                    </ul>
                  </div>

                  <div className="orderInfo">
                    <div className="vehicleInfo">
                      <ul>
                        <li className="infoHdn">
                          <h3>{t("common.vehicle")}</h3>
                        </li>
                        <li className="infoHdn">
                          <h3></h3>
                        </li>
                        <li>
                          <h4>{t("vehicle.type")}</h4>
                          <span>{orderDetails?.vehicle_type}</span>
                        </li>
                        <li>
                          <h4>{t("vehicle.model")}</h4>
                          <span>{orderDetails?.model}</span>
                        </li>
                        <li>
                          <h4>{t("vehicle.manufacturer")}</h4>
                          <span>{orderDetails?.vehicle_manufacturer}</span>
                        </li>
                        <li>
                          <h4>{t("vehicle.year")}</h4>
                          <span>{orderDetails?.model_year}</span>
                        </li>
                        <li>
                          <h4>{t("vehicle.series")}</h4>
                          <span>{orderDetails?.series}</span>
                        </li>
                        <li>
                          <h4>{t("vehicle.mileage")}</h4>
                          <span>{orderDetails?.mileage}</span>
                        </li>
                        <li>
                          <h4>{t("vehicle.version")}</h4>
                          <span>{orderDetails?.version}</span>
                        </li>
                      </ul>

                      <ul>
                        <li className="infoHdn">
                          <h3>{t("engine.title")}</h3>
                        </li>
                        <li className="infoHdn">
                          <h3>{t("ecu.title")}</h3>
                        </li>
                        <li>
                          <h4>{t("engine.type")}</h4>
                          <span>{orderDetails?.engine_type}</span>
                        </li>
                        <li>
                          <h4>{t("ecu.manufacturer")}</h4>
                          <span>{orderDetails?.ecu_manufacturer}</span>
                        </li>
                        <li>
                          <h4>{t("engine.vin")}</h4>
                          <span>{orderDetails?.cylinder}</span>
                        </li>
                        <li>
                          <h4>{t("ecu.build")}</h4>
                          <span>{orderDetails?.build}</span>
                        </li>
                        <li>
                          <h4>{t("engine.puissance")}</h4>
                          <span>{orderDetails?.puissance}</span>
                        </li>
                        <li>
                          <h4>{t("ecu.hardware")}</h4>
                          <span>{orderDetails?.hardware}</span>
                        </li>
                        <li>
                          <h4>{t("engine.transmission")}</h4>
                          <span>{orderDetails?.transmission}</span>
                        </li>
                        <li>
                          <h4>{t("ecu.software")}</h4>
                          <span>{orderDetails?.software}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="vehicleInfo otherInfo">
                      <ul>
                        <li className="infoHdn">
                          <h3>{t("common.other")}</h3>
                        </li>
                        <li>
                          <h4>{t("common.read_hardware")}</h4>
                          <span>{orderDetails?.read_hardware}</span>
                        </li>
                        <li>
                          <h4>{t("ecu.build")}</h4>
                          <span>{orderDetails?.build}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="vehicleInfo orderService">
                      <ul>
                        <li className="infoHdn">
                          <h3>{t("reseller.orders")}</h3>
                        </li>
                        <li className="infoHdn">
                          <h3></h3>
                        </li>
                        <li>
                          <h4>{t("order.stage")}</h4>
                          <span>{orderDetails?.stage}</span>
                        </li>
                        <li>
                          <h4>{t("order.other_services")}</h4>
                          {/* <span> {orderDetails?.other_services}</span> */}
                          <span>
                            {getParsedOtherServices(
                              orderDetails?.other_services
                            )}
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="vehicleInfo uploadInfo">
                      <ul>
                        {orderDetails?.order_files?.length > 0 ? (
                          orderDetails?.order_files?.map((item) => {
                            <li>
                              <input
                                type="text"
                                value={imageBaseUrl + item?.file}
                              />
                              <button
                                className="btn btn-success"
                                onClick={() =>
                                  downloadFile(imageBaseUrl + item?.file)
                                }
                              >
                                {t("common.download_file")}
                              </button>
                            </li>;
                          })
                        ) : (
                          <li>
                            <input
                              type="text"
                              value={t("common.file_not_found")}
                              disabled
                            />
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="files-section">
                      <div className="file-group">
                        <h3 className="details-subtitle">
                          {t("order.original_file")}
                        </h3>

                        {orderDetails?.order_files?.filter(
                          (item) => item?.file_type === "original"
                        )?.length > 0 ? (
                          orderDetails?.order_files
                            .filter((item) => item?.file_type === "original")
                            .map((item, index) => (
                              <div className="file-item" key={index}>
                                <div className="file-name">
                                  {item?.file?.split("/").pop()}
                                </div>
                                <button
                                  className="btn btn-success"
                                  onClick={() =>
                                    downloadFile(IMAGE_URL + item?.file)
                                  }
                                >
                                  {t("common.download_file")}
                                </button>
                              </div>
                            ))
                        ) : (
                          <div className="file-item">
                            <div className="file-name">
                              {t("common.file_not_found")}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="file-group">
                        <h3 className="details-subtitle">
                          {t("order.modified_file")}
                        </h3>
                        {orderDetails?.order_files?.filter(
                          (item) => item?.file_type === "modified"
                        )?.length > 0 ? (
                          orderDetails?.order_files
                            .filter((item) => item?.file_type === "modified")
                            .map((item, index) => (
                              <div className="file-item" key={index}>
                                <div className="file-name">
                                  {item?.file?.split("/").pop()}
                                </div>
                                <button
                                  className="btn btn-success"
                                  onClick={() =>
                                    downloadFile(IMAGE_URL + item?.file)
                                  }
                                >
                                  {t("common.download_file")}
                                </button>
                              </div>
                            ))
                        ) : (
                          <div className="file-item">
                            <div className="file-name">Upload File</div>
                            <button
                              onClick={modifiedFile}
                              className="btn btn-success"
                              disabled={fileUploading || count > 0}
                              style={{
                                width: "125px",
                                textAlign: "center",
                                cursor: fileUploading
                                  ? "not-allowed"
                                  : "pointer",
                              }}
                            >
                              {fileUploading && count == 0 ? (
                                <>
                                  <CircularProgress
                                    size="10px"
                                    style={{ color: "#fff" }}
                                  />
                                  Uploading...
                                </>
                              ) : (
                                // t("common.upload_file")
                                <>Upload file</>
                              )}
                            </button>
                            <input
                              type="file"
                              ref={modifiedRef}
                              onChange={uploadModifiedFile}
                              style={{ display: "none" }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "paypal" && (
                <div className="resellerTab pointTab">
                  <div className="resellerForm">
                    <ul>
                      <li>
                        <label>PayPal payment id</label>
                        <input
                          type="text"
                          value={orderDetails?.paypal_payment_id}
                          disabled
                        />
                      </li>
                      <li>
                        <label>PayPal customer id</label>
                        <input
                          type="text"
                          value={orderDetails?.paypal_customer_id}
                          disabled
                        />
                      </li>
                      <li>
                        <label>Email Paypal</label>
                        <input
                          type="text"
                          value={orderDetails?.paypal_email}
                          disabled
                        />
                      </li>
                      <li>
                        <label>PayPal Name</label>
                        <input
                          type="text"
                          value={orderDetails?.paypal_name}
                          disabled
                        />
                      </li>
                      <li>
                        <label>Phone Paypal</label>
                        <input
                          type="text"
                          value={orderDetails?.paypal_phone}
                          disabled
                        />
                      </li>
                      <li>
                        <label>PayPal country code</label>
                        <input
                          type="text"
                          value={orderDetails?.paypal_country_code}
                          disabled
                        />
                      </li>
                    </ul>
                  </div>

                  {/* <div className="dashTop">
                    <h2 className="resellerHdn"></h2>

                    <div className="resellerBtns">
                      <button className="saveBtn">Save</button>
                      <button className="trashBtn">Delete</button>
                    </div>
                  </div> */}
                </div>
              )}

              {activeTab === "stripe" && (
                <div className="resellerTab pointTab">
                  <div className="resellerForm">
                    <ul>
                      <li>
                        <label>Payment Intent id</label>
                        <input
                          type="text"
                          value={orderDetails?.stripe_payment_intent_id}
                          disabled
                        />
                      </li>
                      <li>
                        <label>Customer id</label>
                        <input
                          type="text"
                          value={orderDetails?.stripe_customer_id}
                          disabled
                        />
                      </li>
                      <li>
                        <label>Client secret</label>
                        <input
                          type="text"
                          value={orderDetails?.stripe_client_secret}
                          disabled
                        />
                      </li>
                      <li>
                        <label>Receipt URL</label>
                        <input
                          type="text"
                          value={orderDetails?.stripe_receipt_url}
                          disabled
                        />
                      </li>
                      <li>
                        <label>Status</label>
                        <input
                          type="text"
                          value={orderDetails?.stripe_status}
                          disabled
                        />
                      </li>
                    </ul>
                  </div>

                  {/* <div className="dashTop">
                    <h2 className="resellerHdn"></h2>

                    <div className="resellerBtns">
                      <button className="saveBtn">Save</button>
                      <button className="trashBtn">Delete</button>
                    </div>
                  </div> */}
                </div>
              )}

              {activeTab === "request" && (
                <div className="resellerTab orderTab">
                  <div className="resellerTable">
                    <table className="custom-data-table">
                      <thead>
                        <tr>
                          <th
                            onClick={() => handleSort("date")}
                            className={`sortable ${
                              sortBy === "date" ? sortOrder : ""
                            }`}
                          >
                            <span>{t("common.date")}</span>
                          </th>
                          <th>{t("common.code")}</th>
                          <th>{t("common.problem")}</th>
                          <th>{t("common.request")}</th>
                          <th>{t("common.status")}</th>
                          <th>{t("common.actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {afterServices?.length > 0 ? (
                          afterServices.map((service) => (
                            <tr key={service.id}>
                              <td>
                                {new Date(
                                  service.created_at
                                ).toLocaleDateString()}
                              </td>
                              <td>{service.service_key}</td>
                              <td>{service.issue}</td>
                              <td>{service.modification}</td>
                              <td>
                                {service.status === 0
                                  ? t("order.waiting")
                                  : service.status === 1
                                  ? t("order.accepted")
                                  : service.status === 2
                                  ? t("order.refused")
                                  : ""}
                              </td>
                              <td>
                                <button
                                  className="viewBtn"
                                  onClick={() => openAfterServicePopup(service)}
                                >
                                  {t("common.view")}
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} style={{ textAlign: "center" }}>
                              {t("common.result.no_record")}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="dashTop orderRequest">
                    <h2 className="resellerHdn"></h2>

                    <div className="resellerBtns">
                      <button className="saveBtn">Save</button>
                      <button className="trashBtn">Delete</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {showPopup && (
          <div className="popupOverlay">
            <div className="popupContent2 cancelPopup">
              <div className="popupHeader">
                <h2>Order Cancellation</h2>
                <img
                  src={CrossIcon}
                  alt=""
                  className="closeBtn"
                  onClick={closePopup}
                />
              </div>

              <div className="resellerForm">
                <ul>
                  <li>
                    <label>Reason for Cancellation*</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    >
                      <option value="">Select Reason</option>
                      <option value="Too Many Orders to Fulfill">
                        Too Many Orders to Fulfill
                      </option>
                      <option value="No Longer Offering This Service">
                        No Longer Offering This Service
                      </option>
                      <option value="Other">Other</option>
                    </select>
                  </li>
                  <li>
                    <label>Message*</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe here"
                    />
                  </li>
                </ul>
                <div className="popBtns">
                  <button className="packageBtn" onClick={handleCancelSubmit}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showPopup2 && (
          <div className="popupOverlay">
            <div className="popupContent confirmPopup" ref={confirmRef}>
              <img src={ConfirmationIcon} alt="" />
              <h2>Order Cancellation Confirmation!</h2>
              <p>
                We wanted to inform you that your order Orders ID:{" "}
                <strong>{orderDetails?.order_key}</strong> has been successfully
                canceled.
              </p>
              <p>
                The refundable amount or token will be processed within
                <br></br>
                <strong>3 business days.</strong>
              </p>
            </div>
          </div>
        )}

        {showAfterServicePopup && selectedAfterService && (
          <div className="popupOverlay">
            <div className="popupContent2 requestPopup">
              <div className="popupHeader">
                <h2>{selectedAfterService.service_key}</h2>
                <img
                  src={CrossIcon}
                  alt="Close"
                  className="closeBtn"
                  onClick={closeAfterServicePopup}
                />
              </div>

              <div className="resellerForm">
                <ul>
                  <li>
                    <label>{t("order.after_sale_service")}</label>
                  </li>
                  <li>
                    <label>{t("order.requests")}</label>
                    <p>{selectedAfterService.issue}</p>
                  </li>
                  <li>
                    <label>{t("order.modify_request")}</label>
                    <p>{selectedAfterService.modification}</p>
                  </li>
                  <li>
                    <label>{t("order.code")}</label>
                    <p>{selectedAfterService.comments}</p>
                  </li>
                  <li>
                    <label>{t("common.response")}</label>
                    <p>{selectedAfterService.response || ""}</p>
                  </li>
                  <li>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      accept=".bin,.hex,.txt"
                      onChange={(e) =>
                        handleECUFileUpload(e, selectedAfterService.id)
                      }
                    />

                    <button
                      className="uploadButton"
                      onClick={() => fileInputRef.current.click()}
                      title={t("order.corrected_file")}
                      disabled={uploading}
                    >
                      {uploading
                        ? t("order.uploading")
                        : t("order.corrected_file")}
                    </button>
                  </li>
                  <li>
                    {orderDetails?.order_files
                      ?.filter(
                        (item) =>
                          item?.order_after_service_id ===
                          selectedAfterService.id
                      )
                      .map((item) => (
                        <span
                          className="file-item"
                          key={item?.order_after_service_id}
                        >
                          <span className="corrected-file-name">
                            {item?.file?.split("/").pop()}
                          </span>
                          <button
                            className="btn btn-success"
                            onClick={() => downloadFile(IMAGE_URL + item?.file)}
                          >
                            {t("order.download_file")}
                          </button>
                        </span>
                      ))}
                  </li>
                </ul>

                <div className="popBtns">
                  {selectedAfterService.status !== 2 && (
                    <button
                      className="refuseButton"
                      onClick={() =>
                        handleRejectAfterService(selectedAfterService.id)
                      }
                    >
                      {t("order.reject_service")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResellerOrderDetails;
