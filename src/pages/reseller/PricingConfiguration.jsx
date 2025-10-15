import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import i18n from "../../i18n";
import CircularProgress, {
  circularProgressClasses,
} from "@mui/material/CircularProgress";
import ResellerSidebar from "@layouts/ResellerSidebar";
import ResellerHeader from "@layouts/ResellerHeader";

import TableFooter from "@layouts/TableFooter";
import { exportToCSV, printData } from "@/utils/exportUtils";
import {
  CrossIcon,
  PdfIcon,
  FileIcon,
  DropIcon,
  fullscreenIcon,
  exitFullscreenIcon,
} from "@/assets/images";
import { IMAGE_URL } from "../../utils/apiUrl";

function PricingConfiguration() {
  const [loading, setLoading] = useState(false);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("desc");
  const [serviceSortBy, setServiceSortBy] = useState("title");
  const [serviceSortOrder, setServiceSortOrder] = useState("desc");
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(1);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    vat: "",
    is_default: false,
  });

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [services, setServices] = useState([]);
  const [resellerVehicleTypes, setResellerVehicleTypes] = useState([]);
  const [resellerServices, setResellerServices] = useState([]);
  const [pricingId, setPricingId] = useState(null);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const { t } = useTranslation();
  const [languageCode, setlanguageCode] = useState(i18n.language);
  const [vehicleTypeTranslations, setVehicleTypeTranslations] = useState([]);
  const [commonTranslations, setCommonTranslations] = useState([]);

  const getVehicleTranslation = (key) => {
    const item = vehicleTypeTranslations.find((t) => t.key === key);
    return item ? item.text : key; // fallback to key if no translation
  };

  const getCommonTranslation = (key) => {
    const item = commonTranslations.find((t) => t.key === key);
    return item ? item.text : key; // fallback to key if no translation
  };

  const getAllRecords = async (totalRecords) => {
    const response = await API.get("/resellers/pricing", {
      params: {
        search,
        page: 1,
        perPage: totalRecords,
        sortBy,
        sortOrder,
      },
    });

    setAllRecords(response.data.data || []);
  };

  const handleExportCSV = async () => {
    exportToCSV(
      allRecords,
      `TuningFile - ${t("sidebar.pricing_configuration")}`,
      (item) => ({
        Title: item.title,
      })
    );
  };

  const handlePrint = async () => {
    printData(
      allRecords,
      [{ key: "title", label: "Title" }],
      t("sidebar.pricing_configuration")
    );
  };

  const fetchDefaultVehicleTypes = async () => {
    try {
      setVehicleLoading(true);
      const response = await API.get("/vehicles/types");
      const data = response.data.data || [];

      const formattedVehicleTypes = data.map((vehicleType, index) => ({
        ...vehicleType,
        vehicle_type_id: vehicleType.id,
        is_available: false,
        display_order: index + 1,
      }));

      setVehicleTypes(data); // original list
      setResellerVehicleTypes(formattedVehicleTypes); // formatted for form
    } catch (error) {
      console.error("Error fetching vehicle types", error);
    } finally {
      setVehicleLoading(false);
    }
  };

  const fetchDefaultServices = async () => {
    try {
      setServiceLoading(true);
      const response = await API.get("/services");
      const data = response.data.data || [];

      const formattedServices = data.map((service) => ({
        ...service,
        service_id: service.id,
        selling_price: "",
        for_sale: false,
        warning_popup: false,
        vehicle_type_name: service.vehicle_type_name || "",
      }));

      setServices(data); // original list
      setResellerServices(formattedServices); // formatted for form
    } catch (error) {
      console.error("Error fetching services", error);
    } finally {
      setServiceLoading(false);
    }
  };

  const getRecords = async () => {
    try {
      setLoading(true);
      const response = await API.get("/resellers/pricing", {
        params: {
          search,
          page,
          perPage,
          sortBy,
          sortOrder,
        },
      });

      setRecords(response.data.data);
      setTotalPages(response.data.last_page);
      setTotalRecords(response.data.total);
      getAllRecords(response.data.total);
    } catch (error) {
      console.error("Error fetching resellers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRecords();
    fetchDefaultVehicleTypes();
    fetchDefaultServices();
  }, [search, page, perPage, sortBy, sortOrder]);

  const handleSort = (column) => {
    setSortBy(column);
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
    dragItem.current = index;
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
  };
  const handleDrop = async () => {
    if (!pricingId) return;
    setDraggedIndex(null);
    const items = [...resellerVehicleTypes];
    const draggedItem = items[dragItem.current];
    items.splice(dragItem.current, 1);
    items.splice(dragOverItem.current, 0, draggedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index + 1,
    }));

    setResellerVehicleTypes(items);

    const orderPayload = {};

    updatedItems.forEach((item) => {
      orderPayload[item.id] = item.display_order;
    });

    dragItem.current = null;
    dragOverItem.current = null;

    setIsSubmitting(true);
    try {
      const response = await API.post(
        `/resellers/pricing/vehicle-types/update-order`,
        {
          display_order: orderPayload,
        }
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addRecord = async (formData) => {
    setIsSubmitting(true);
    try {
      const response = await API.post(`/resellers/pricing`, formData);
      toast.success(response?.data?.message || t("common.create.success"), {
        theme: "dark",
        autoClose: 2000,
      });
      getRecords();
      closePopup();
      return response;
    } catch (error) {
      toast.error(error?.response?.data?.message || t("common.create.error"), {
        theme: "dark",
        autoClose: 2000,
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRecord = async (RecordId, formData) => {
    setIsSubmitting(true);
    try {
      const response = await API.put(
        `/resellers/pricing/${RecordId}`,
        formData
      );
      toast.success(response?.data?.message || t("common.update.success"), {
        theme: "dark",
        autoClose: 2000,
      });
      getRecords();
      //closePopup();
    } catch (error) {
      toast.error(error?.response?.data?.message || t("common.update.error"), {
        theme: "dark",
        autoClose: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (formMode === "edit" && selectedRecord) {
      setFormData({
        title: selectedRecord.title || "",
        vat: selectedRecord.vat || "",
        is_default: selectedRecord.is_default || false,
      });
    } else {
      setFormData({
        title: "",
        vat: "",
        is_default: false,
      });
    }
  }, [formMode, selectedRecord]);

  const handleInputChange = (e) => {
    const { name, type, value, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const openAddPopup = () => {
    setFormMode("add");
    setSelectedRecord(null);
    setPricingId(null);
    setTimeout(() => setShowPopup(true), 0);
  };

  const openEditPopup = (service) => {
    setFormMode("edit");
    setSelectedRecord(service);
    setPricingId(service.id);
    setTimeout(() => setShowPopup(true), 0);
  };

  const handleSubmit = async () => {
    let pricingId;

    if (formMode === "edit") {
      const response = await updateRecord(selectedRecord.id, formData);
      pricingId = selectedRecord.id;
    } else {
      const response = await addRecord(formData);
      pricingId = response?.data?.data?.id;
    }

    if (pricingId) {
      await Promise.all([
        API.post(`/resellers/pricing/${pricingId}/services/bulk`, {
          services: resellerServices.map((service) => ({
            service_id: service.id,
            selling_price: service.selling_price || 0,
            for_sale: !!service.for_sale,
            warning_popup: !!service.warning_popup,
            display_order_stage: service.display_order_stage || 0,
            display_order_other: service.display_order_other || 0,
          })),
        }),

        API.post(`/resellers/pricing/${pricingId}/vehicle-types/bulk`, {
          vehicle_types: resellerVehicleTypes.map((vehicleType) => ({
            vehicle_type_id: vehicleType.vehicle_type_id,
            is_available: !!vehicleType.is_available,
            display_order: vehicleType.display_order || 0,
          })),
        }),
      ]);
    }
  };

  const handleSingleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;

    try {
      await API.delete(`/resellers/pricing/${id}`);
      toast.success(t("common.delete.success"), {
        theme: "dark",
        autoClose: 2000,
      });
      getRecords();
    } catch (error) {
      toast.error(error?.response?.data?.message || t("common.delete.error"), {
        theme: "dark",
        autoClose: 2000,
      });
    }
  };

  const [activeTab, setActiveTab] = useState("service");

  const fetchServicesForPricing = async (pricingId) => {
    try {
      setServiceLoading(true);
      const response = await API.get(
        `/resellers/pricing/${pricingId}/services`
      );
      const data = response.data.data || [];

      // Map data to track pre-filled values like price, on_sale, warning_popup
      const updatedServices = services.map((service) => {
        const matched = data.find((s) => s.service_id === service.id);
        return {
          ...service,
          service_id: service.id,
          selling_price: matched?.selling_price || "",
          for_sale: matched?.for_sale || false,
          warning_popup: matched?.warning_popup || false,
          vehicle_type_name: matched?.vehicle_type_name || "",
          display_order_stage: matched?.display_order_stage || "",
          display_order_other: matched?.display_order_other || "",
        };
      });

      setResellerServices(updatedServices);
    } catch (error) {
      console.error("Error fetching service pricing", error);
    } finally {
      setServiceLoading(false);
    }
  };

  const fetchSelectedVehicleTypes = async (pricingId) => {
    try {
      setVehicleLoading(true);
      const response = await API.get(
        `/resellers/pricing/${pricingId}/vehicle-types`,
        {
          params: {
            search,
            page: 1,
            perPage: totalRecords,
            sortBy: "display_order",
            sortOrder: "asc",
          },
        }
      );
      const data = response.data.data || [];

      const updatedVehicleTypes = vehicleTypes.map((vehicleType) => {
        const matched = data.find((s) => s.vehicle_type_id === vehicleType.id);

        return {
          ...vehicleType,
          vehicle_type_id: vehicleType.id,
          id: matched?.id ?? null,
          is_available: matched?.is_available ?? false,
          display_order: matched?.display_order ?? null,
        };
      });

      updatedVehicleTypes.sort((a, b) => {
        if (a.display_order == null) return 1;
        if (b.display_order == null) return -1;
        return a.display_order - b.display_order;
      });

      setResellerVehicleTypes(updatedVehicleTypes);
    } catch (error) {
      console.error("Error fetching selected vehicle types", error);
    } finally {
      setVehicleLoading(false);
    }
  };

  useEffect(() => {
    if (showPopup) {
      if (formMode === "edit" && pricingId) {
        fetchServicesForPricing(pricingId);
        fetchSelectedVehicleTypes(pricingId);
      } else if (formMode === "add") {
        fetchDefaultServices();
        fetchDefaultVehicleTypes();
      }
    }
  }, [showPopup, formMode, pricingId]);

  const updateServiceField = (serviceId, field, value) => {
    setResellerServices((prev) =>
      prev.map((service) =>
        service.service_id === serviceId
          ? { ...service, [field]: value }
          : service
      )
    );
  };

  const updateVehicleTypeField = (vehicleTypeId, field, value) => {
    setResellerVehicleTypes((prev) =>
      prev.map((vehicle) =>
        vehicle.vehicle_type_id === vehicleTypeId
          ? { ...vehicle, [field]: value }
          : vehicle
      )
    );
  };

  const fetchTranslations = async (languageCode) => {
    try {
      const response = await API.get(`/languages/${languageCode}/translations`);
      const data = response.data.data || [];
      setVehicleTypeTranslations(data.vehicles || []);
      setCommonTranslations(data.common || []);
    } catch (error) {
      console.error("Error fetching service pricing", error);
    }
  };

  useEffect(() => {
    if (languageCode) {
      fetchTranslations(languageCode);
    }
  }, [languageCode]);

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

  const handleServiceSort = (column) => {
    setServiceSortBy(column);
    setServiceSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const sortedServices = useMemo(() => {
    const sorted = [...resellerServices];

    if (serviceSortBy) {
      sorted.sort((a, b) => {
        const aVal = a[serviceSortBy]?.toString().toLowerCase() ?? "";
        const bVal = b[serviceSortBy]?.toString().toLowerCase() ?? "";

        if (aVal < bVal) return serviceSortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return serviceSortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return sorted;
  }, [resellerServices, serviceSortBy, serviceSortOrder]);

  return (
    <div className="fullWidth">
      <div className="main">
        <ResellerSidebar />
        <div className="container">
          <ResellerHeader pageTitle={t("sidebar.pricing_configuration")} />
          <div className="mainInnerDiv">
            <div className="resellerFilter">
              <div className="searchFilter">
                <input
                  type="text"
                  placeholder={t("common.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="sortFilter">
                {/* <button className="deleteBtn deactivateBtn">
                    {t("common.delete")}
                  </button> */}
                <button className="pdfBtn" onClick={handlePrint}>
                  <img src={PdfIcon} alt={t("common.pdf")} />
                </button>
                <button className="fileBtn" onClick={handleExportCSV}>
                  <img src={FileIcon} alt={t("common.file")} />
                </button>
                <button className="addBtn" onClick={openAddPopup}>
                  {t("common.add_new")}
                </button>
              </div>
            </div>

            <div className="resellerTable">
              <table className="custom-table priceCheck">
                <thead>
                  <tr className="table-row">
                    <th
                      onClick={() => handleSort("title")}
                      className={`left-side sortable ${
                        sortBy === "title" ? sortOrder : ""
                      }`}
                    >
                      <span>{t("common.title")}</span>
                    </th>
                    <th className="right-side">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="2"
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        {t("common.loading")}...
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.id} className="table-row">
                        <td className="left-side">
                          <span>{record.title}</span>
                        </td>
                        <td className="right-side">
                          {/* <button
                            className="viewBtn ecuEditBtn"
                            onClick={() => openEditPopup(record)}
                          >
                            {t("common.edit")}
                          </button> */}
                          <button
                            className="viewBtn"
                            onClick={() => openEditPopup(record)}
                          >
                            {t("common.view")}
                          </button>
                          <button
                            className="trashBtn"
                            onClick={() => handleSingleDelete(record.id)}
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
              onPerPageChange={(newPerPage) => {
                setPerPage(newPerPage);
                setPage(1);
              }}
            />
          </div>
        </div>

        {showPopup && (
          <div className="popupOverlay">
            <div className="popupContent2">
              <div className="popupHeader">
                <h2>{t("sidebar.pricing_configuration")}</h2>
                <img
                  src={CrossIcon}
                  alt=""
                  className="closeBtn"
                  onClick={closePopup}
                />
              </div>
              <div className="priceModalBody">
                <div className="resellerForm langPopup">
                  <ul>
                    <li>
                      <label>{t("common.title")}</label>
                      <input
                        type="text"
                        name="title"
                        placeholder={t("common.enter_here")}
                        value={formData.title}
                        onChange={handleInputChange}
                      />
                    </li>
                    <li>
                      <label>{t("service.vat_rate")}*</label>
                      <input
                        type="text"
                        name="vat"
                        placeholder="0"
                        value={formData.vat}
                        onChange={handleInputChange}
                      />
                    </li>
                    <li>
                      <div className="checkForm">
                        <span>{t("service.default_table")}</span>
                        <input
                          type="checkbox"
                          name="is_default"
                          checked={formData.is_default}
                          onChange={handleInputChange}
                        />
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="resellerNav">
                  <ul>
                    <li>
                      <Link
                        className={activeTab === "service" ? "active" : ""}
                        onClick={() => setActiveTab("service")}
                      >
                        {t("service.service_pricing")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        className={activeTab === "types" ? "active" : ""}
                        onClick={() => setActiveTab("types")}
                      >
                        {t("service.available_vehicle_types")}
                      </Link>
                    </li>
                  </ul>
                </div>

                {activeTab === "service" && (
                  <div
                    id="table-container"
                    className={`resellerTab orderTab ${
                      isFullscreen ? "fullscreen-active" : ""
                    }`}
                  >
                    <div className="resellerTable addServiceTable">
                      <table className="custom-data-table">
                        <thead>
                          <tr>
                            <th
                              onClick={() => handleServiceSort("title")}
                              className={`sortable ${
                                serviceSortBy === "title"
                                  ? serviceSortOrder
                                  : ""
                              }`}
                              style={{ cursor: "pointer" }}
                            >
                              {t("service.product_name")}
                            </th>

                            <th
                              onClick={() =>
                                handleServiceSort("vehicle_type_name")
                              }
                              className={`sortable ${
                                serviceSortBy === "vehicle_type_name"
                                  ? serviceSortOrder
                                  : ""
                              }`}
                              style={{ cursor: "pointer" }}
                            >
                              {t("vehicle.type")}
                            </th>
                            <th>{t("service.sale_price_excl_tax")}</th>
                            <th>{t("service.for_sale")}</th>
                            <th>{t("service.warning_popup")}</th>
                            <th>{getCommonTranslation("Stage")}</th>
                            <th className="right-side">
                              {getCommonTranslation("Other")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {serviceLoading ? (
                            <tr>
                              <td
                                colSpan="7"
                                style={{
                                  textAlign: "center",
                                  padding: "20px",
                                }}
                              >
                                {t("common.loading")}...
                              </td>
                            </tr>
                          ) : !resellerServices ||
                            resellerServices.length === 0 ? (
                            <tr>
                              <td
                                colSpan="7"
                                style={{
                                  textAlign: "center",
                                  padding: "20px",
                                }}
                              >
                                {t("common.result.no_record")}...
                              </td>
                            </tr>
                          ) : (
                            sortedServices.map((service) => (
                              <tr key={service.id}>
                                <td>{service.title}</td>
                                <td>{service.vehicle_type_name}</td>
                                <td>
                                  <input
                                    type="number"
                                    name="selling_price"
                                    value={service.selling_price ?? ""}
                                    onChange={(e) =>
                                      updateServiceField(
                                        service.id,
                                        "selling_price",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter price"
                                  />
                                </td>
                                <td style={{ textAlign: "center" }}>
                                  <input
                                    type="checkbox"
                                    name="for_sale"
                                    checked={!!service.for_sale}
                                    onChange={(e) =>
                                      updateServiceField(
                                        service.id,
                                        "for_sale",
                                        e.target.checked
                                      )
                                    }
                                  />
                                </td>
                                <td style={{ textAlign: "center" }}>
                                  <input
                                    type="checkbox"
                                    name="warning_popup"
                                    checked={!!service.warning_popup}
                                    onChange={(e) =>
                                      updateServiceField(
                                        service.id,
                                        "warning_popup",
                                        e.target.checked
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    name="display_order_stage"
                                    value={service.display_order_stage ?? ""}
                                    style={{ width: 60 }}
                                    onChange={(e) =>
                                      updateServiceField(
                                        service.id,
                                        "display_order_stage",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    name="display_order_other"
                                    value={service.display_order_other ?? ""}
                                    style={{ width: 60 }}
                                    onChange={(e) =>
                                      updateServiceField(
                                        service.id,
                                        "display_order_other",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === "types" && (
                  <div className="resellerTab orderTab">
                    <div className="resellerTable addServiceTable">
                      <table>
                        <thead>
                          <tr>
                            {formMode === "edit" && (
                              <th
                                style={{ width: "40px", textAlign: "center" }}
                              >
                                ⇅
                              </th>
                            )}
                            <th colSpan={2}>{t("vehicle.type")}</th>
                            <th colSpan={2}>{t("language.translation")}</th>
                            <th colSpan={2}>{t("service.available")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vehicleLoading ? (
                            <tr>
                              <td
                                colSpan="7"
                                style={{
                                  textAlign: "center",
                                  padding: "20px",
                                }}
                              >
                                {t("common.loading")}...
                              </td>
                            </tr>
                          ) : !resellerVehicleTypes ||
                            resellerVehicleTypes.length === 0 ? (
                            <tr>
                              <td
                                colSpan="7"
                                style={{
                                  textAlign: "center",
                                  padding: "20px",
                                }}
                              >
                                {t("common.result.no_record")}...
                              </td>
                            </tr>
                          ) : (
                            resellerVehicleTypes.map((vehicleType, index) => (
                              <tr
                                key={vehicleType.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragEnter={() => handleDragEnter(index)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                className={`${
                                  draggedIndex === index ? "dragging" : ""
                                }`}
                                style={{ cursor: "grab" }}
                              >
                                {formMode === "edit" && (
                                  <td className="drag-handle">≡</td>
                                )}
                                <td colSpan="2">
                                  <span>{vehicleType.name}</span>
                                </td>
                                <td colSpan="2">
                                  <span>
                                    {getVehicleTranslation(vehicleType.name)}
                                  </span>
                                </td>
                                <td colSpan="2">
                                  <input
                                    type="checkbox"
                                    name="is_available"
                                    checked={!!vehicleType.is_available}
                                    onChange={(e) =>
                                      updateVehicleTypeField(
                                        vehicleType.vehicle_type_id,
                                        "is_available",
                                        e.target.checked
                                      )
                                    }
                                  />
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              <div className="dashTop orderRequest">
                <h2 className="resellerHdn"></h2>
                <div className="resellerBtns">
                  <button
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
                  {/* <button className="trashBtn">Delete</button> */}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PricingConfiguration;
