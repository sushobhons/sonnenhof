import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import API from "../../api/axios";
import { useTranslation } from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";
import ResellerSidebar from "../../layouts/ResellerSidebar";
import ResellerHeader from "../../layouts/ResellerHeader";

const ResellerInformation = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    address: "",
    postal_code: "",
    city: "",
    country: "",
    siret_number: "",
    vat_number: "",
    invoice_number: "",
    show_info_popup: false,
    info_popup_message: "",
  });

  const modules = {
    toolbar: [
      [{ bold: true }, { italic: true }, { underline: true }, { strike: true }],
      ["link", "image"],
      ["blockquote", "code-block"],
      [{ header: 1 }, { header: 2 }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],

      [{ indent: "-1" }, { indent: "+1" }],

      [{ header: [1, 2, 3, 4, 5, 6, false] }],

      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      // [{ 'size': ['small', false, 'large', 'huge'] }],

      ["clean"],
    ],
  };

  const formats = [
    "bold",
    "italic",
    "underline",
    "strike",
    "script",
    "blockquote",
    "code-block",
    "header",
    "list",
    "bullet",
    "indent",
    "align",
    "link",
    "image",
    "color",
    "background",
    "font",
    "size",
    "clean",
  ];

  const getResellerDetails = async () => {
    try {
      const response = await API.get(`/reseller/profile`);
      const reseller = response.data.data;

      setFormData({
        company_name: reseller.company_name || "",
        address: reseller.address || "",
        postal_code: reseller.postal_code || "",
        city: reseller.city || "",
        country: reseller.country || "",
        siret_number: reseller.siret_number || "",
        vat_number: reseller.vat_number || "",
        invoice_number: reseller.invoice_number || "",
        show_info_popup: !!reseller.show_info_popup,
        info_popup_message: reseller.info_popup_message || "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || t("common.fetch.error"), {
        theme: "dark",
        autoClose: 2000,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await API.put(`/reseller/profile`, formData);
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

  useEffect(() => {
    getResellerDetails();
  }, [id]);

  return (
    <div className="fullWidth">
      <div className="main">
        <ResellerSidebar />
        <div className="container">
          <ResellerHeader pageTitle={t("sidebar.panel_configuration")} />
          <div className="mainInnerDiv">
            <div className="resellerNav settingNav">
              <ul>
                <li>
                  <Link to="/admin/panel-configuration">
                    {t("reseller.panel.settings")}
                  </Link>
                </li>
                <li>
                  <Link to="/admin/information" className="active">
                    {t("reseller.information")}
                  </Link>
                </li>
                <li>
                  <Link to="/admin/cgu">{t("billing.cgu")}</Link>
                </li>
              </ul>
            </div>

            <div className="resellerForm holderContainer alertForm">
              <ul>
                <li>
                  <label>{t("reseller.address")}</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </li>
                <li>
                  <label>{t("reseller.postal_code")}</label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                  />
                </li>
                <li>
                  <label>{t("reseller.city")}</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </li>
                <li>
                  <label>{t("reseller.country")}</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </li>
                <li>
                  <label>{t("reseller.siret_number")}</label>
                  <input
                    type="text"
                    name="siret_number"
                    value={formData.siret_number}
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
                  <label>{t("reseller.invoice_number")}</label>
                  <input
                    type="text"
                    name="invoice_number"
                    value={formData.invoice_number}
                    onChange={handleChange}
                  />
                </li>
                <li>
                  <div className="checkForm">
                    <span>{t("reseller.show_info_popup")}</span>
                    <input
                      type="checkbox"
                      name="show_info_popup"
                      checked={formData.show_info_popup}
                      onChange={handleChange}
                    />
                  </div>
                </li>
              </ul>
            </div>
            <div className="messagesEditor holderContainer">
              <h3>{t("reseller.info_popup_message")}</h3>

              <ReactQuill
                value={formData.info_popup_message}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    info_popup_message: value,
                  }))
                }
                modules={modules}
                formats={formats}
                theme="snow"
                placeholder=""
              />

              <div className="dashTop editorSave">
                <div className="enablePop"></div>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResellerInformation;
