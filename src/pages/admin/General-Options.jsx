import { useEffect, useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import API from "../../api/axios";
import { useTranslation } from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";

import AdminSidebar from "@layouts/AdminSidebar";
import Header from "@layouts/AdminHeader";

function AdminGeneralSettings() {
  const quillRef = useRef(null);
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    delete_old_ecu: false,
    mail_server_address: "",
    email_account: "",
    mail_server_port: "",
    account_password: "",
    mail_server_address2: "",
    email_account2: "",
    account_password2: "",
    mail_server_port2: "",
    disable_website: false,
    disable_website_message: "",
  });

  const [emailTemplates, setEmailTemplates] = useState([]);

  const getConfigs = async () => {
    try {
      const res = await API.get(`/admin/configs`);
      const configsArray = res.data.data;

      // Convert array of configs to object with key-value pairs
      const configMap = configsArray.reduce((acc, item) => {
        acc[item.name] = item.value;
        return acc;
      }, {});

      // Update only matching keys in formData
      setFormData((prev) => ({
        ...prev,
        mail_server_address: configMap.mail_server_address || "",
        mail_server_port: configMap.mail_server_port || "",
        email_account: configMap.email_account || "",
        account_password: configMap.account_password || "",
        mail_server_address2: configMap.mail_server_address2 || "",
        mail_server_port2: configMap.mail_server_port2 || "",
        email_account2: configMap.email_account2 || "",
        account_password2: configMap.account_password2 || "",
        disable_website: configMap.disable_website || false,
        disable_website_message: configMap.disable_website_message || "",
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || t("common.fetch.error"), {
        theme: "dark",
        autoClose: 2000,
      });
    }
  };

  const getEmailTemplates = async () => {
    try {
      const res = await API.get(`/admin/email-templates`);
      setEmailTemplates(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || t("common.fetch.error"), {
        theme: "dark",
        autoClose: 2000,
      });
    }
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTemplateChange = (key, value) => {
    setEmailTemplates((prev) =>
      prev.map((tpl) => (tpl.key === key ? { ...tpl, message: value } : tpl))
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Format configs as array
      const configPayload = Object.entries(formData).map(([name, value]) => ({
        name,
        value: value ?? "",
      }));

      // Send bulk config update
      await API.post(`/admin/configs`, { configs: configPayload });

      // Send bulk email templates update
      await API.post(`/admin/email-templates`, { templates: emailTemplates });

      toast.success(t("common.update.success"), {
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
    getConfigs();
    getEmailTemplates();
  }, []);

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

  const handleEditorChange = (value) => {
    setEditorContent(value);
  };

  return (
    <div className="fullWidth">
      <div className="main">
        <AdminSidebar />
        <div className="container">
          <Header pageTitle={t("sidebar.general_settings")} />
          <div className="mainInnerDiv">
            <div className="settingHolder">
              <div className="dashTop genTop">
                <h2 className="resellerHdn"></h2>

                <div className="resellerBtns">
                  <div className="delEcu">
                    {t("config.delete_ecu_files_older_than_90_days")}
                    <input
                      type="checkbox"
                      name="delete_old_ecu"
                      checked={formData.delete_old_ecu}
                      onChange={handleChange}
                    />
                  </div>
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

              <div className="resellerForm">
                <ul>
                  <li>
                    <label>{t("config.mail_server_address")}</label>
                    <input
                      type="text"
                      name="mail_server_address"
                      value={formData.mail_server_address || ""}
                      onChange={handleChange}
                    />
                  </li>
                  <li>
                    <label>{t("config.mail_account")}</label>
                    <input
                      type="text"
                      name="email_account"
                      value={formData.email_account || ""}
                      onChange={handleChange}
                    />
                  </li>
                  <li>
                    <label>{t("config.mail_server_address")} 2</label>
                    <input
                      type="text"
                      name="mail_server_address2"
                      value={formData.mail_server_address2 || ""}
                      onChange={handleChange}
                    />
                  </li>
                  <li>
                    <label>{t("config.mail_account")} 2</label>
                    <input
                      type="text"
                      name="email_account2"
                      value={formData.email_account2 || ""}
                      onChange={handleChange}
                    />
                  </li>
                  <li>
                    <label>{t("config.mail_server_port")}</label>
                    <select
                      name="mail_server_port"
                      value={formData.mail_server_port || ""}
                      onChange={handleChange}
                    >
                      <option value="25">25</option>
                      <option value="2525">2525</option>
                      <option value="465">465</option>
                      <option value="587">587</option>
                    </select>
                  </li>
                  <li>
                    <label>{t("config.mail_account_password")}</label>
                    <input
                      type="password"
                      name="account_password"
                      value={formData.account_password || ""}
                      onChange={handleChange}
                    />
                  </li>
                  <li>
                    <label>{t("config.mail_server_port")} 2</label>
                    <select
                      name="mail_server_port2"
                      value={formData.mail_server_port2 || ""}
                      onChange={handleChange}
                    >
                      <option value="25">25</option>
                      <option value="2525">2525</option>
                      <option value="465">465</option>
                      <option value="587">587</option>
                    </select>
                  </li>
                  <li>
                    <label>{t("config.mail_account_password")} 2</label>
                    <input
                      type="password"
                      name="account_password2"
                      value={formData.account_password2 || ""}
                      onChange={handleChange}
                    />
                  </li>
                </ul>
              </div>

              <div className="messagesEditor notesEditor genInner">
                {emailTemplates?.map((template, index) => (
                  <div className="resellerForm" key={template.id}>
                    <ul>
                      <li>
                        <label>
                          {t("config.mail_subject")}{" "}
                          {t(`config.${template.type}`)}
                        </label>
                        <input
                          type="text"
                          value={template.title}
                          onChange={(e) => {
                            const updatedTemplates = [...emailTemplates];
                            updatedTemplates[index].title = e.target.value;
                            setEmailTemplates(updatedTemplates);
                          }}
                        />
                      </li>
                      <li>
                        <label>
                          {t("config.mail_message")}{" "}
                          {t(`config.${template.type}`)}
                        </label>
                        <ReactQuill
                          ref={quillRef}
                          value={template.content}
                          onChange={(val) => {
                            const updatedTemplates = [...emailTemplates];
                            updatedTemplates[index].content = val;
                            setEmailTemplates(updatedTemplates);
                          }}
                          modules={modules}
                          formats={formats}
                          theme="snow"
                        />
                      </li>
                    </ul>
                  </div>
                ))}

                {/* <div className="resellerForm">
                  <ul>
                    <li>
                      <div className="checkForm">
                        <span>{t("config.disable_site")}</span>
                        <input
                          type="checkbox"
                          name="disable_website"
                          checked={formData.disable_website}
                          onChange={handleChange}
                        />
                      </div>
                    </li>
                    <li>
                      <label>{t("config.site_disable_message")}</label>
                      <ReactQuill
                        ref={quillRef}
                        value={formData.disable_website_message || ""}
                        onChange={(val) =>
                          setFormData((prev) => ({
                            ...prev,
                            disable_website_message: val,
                          }))
                        }
                        modules={modules}
                        formats={formats}
                        theme="snow"
                      />
                    </li>
                  </ul>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminGeneralSettings;
