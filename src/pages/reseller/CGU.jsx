import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ResellerSidebar from "../../layouts/ResellerSidebar";
import ResellerHeader from "../../layouts/ResellerHeader";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { IMAGE_URL } from "../../utils/apiUrl";
import API from "../../api/axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

function ResellerCGU() {
  const { t } = useTranslation();
  const [editorContent, setEditorContent] = useState("");
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

  const updateTerms = async () => {
    try {
      const formData = new FormData();
      formData.append("terms_conditions", editorContent);
      const apiRes = await API.put(`/reseller/profile`, formData);
      if (apiRes.data.success) {
        toast.success(apiRes.data.message, 2000);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fullWidth">
      <div className="main">
        <ResellerSidebar />
        <div className="container">
          <ResellerHeader pageTitle={t("sidebar.panel_configuration")} />
          <div className="mainInnerDiv">
            <div className="resellerNav">
              <ul>
                <li>
                  <Link to="/admin/panel-configuration">
                    {t("reseller.panel.settings")}
                  </Link>
                </li>
                <li>
                  <Link to="/admin/information">
                    {t("reseller.information")}
                  </Link>
                </li>
                <li>
                  <Link to="/admin/cgu" className="active">
                    {t("billing.cgu")}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="messagesEditor notesEditor">
              <h3>{t("billing.cgu")}</h3>
              <ReactQuill
                value={editorContent}
                onChange={handleEditorChange}
                modules={modules}
                formats={formats}
                theme="snow"
                placeholder=""
              />

              <div className="dashTop editorSave">
                <div className="enablePop"></div>
                <div className="resellerBtns">
                  <button className="saveBtn" onClick={() => updateTerms()}>
                    {t("common.save")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResellerCGU;
