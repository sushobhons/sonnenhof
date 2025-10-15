import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";
import API from "../../api/axios";
import { useTranslation } from "react-i18next";
import TableFooter from "@layouts/TableFooter";
import useAuth from "../../auth/useAuth";
import ResellerSidebar from "@layouts/ResellerSidebar";
import ResellerHeader from "@layouts/ResellerHeader";
import defaultProfileImg from "../../assets/images/default-profile-img.png";
import loaderImg from "../../assets/images/loader.gif";
import {
  PdfIcon,
  FileIcon,
  DropIcon,
  CrossIcon,
  TrashIcon,
  PlusIcon,
  coinImg,
} from "@/assets/images";
import { IMAGE_URL } from "../../utils/apiUrl";

function ResellerTokenPackages() {
  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("asc");
  const [totalRecords, setTotalRecords] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageUploadLoader, setImageUploadLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    title: "",
    tokens: "",
    amount: "",
    vat: "",
  });

  const [logo, setLogo] = useState();
  const [logoName, setLogoName] = useState();

  const { t } = useTranslation();
  const { user } = useAuth();
  const id = user?.reseller_id;

  const getPackages = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/resellers/token-packages`, {
        params: { search, page, perPage, sortBy, sortOrder },
      });

      setPackages(response.data.data.data);
      setTotalRecords(response.data.data.total);
      setTotalPages(response.data.data.last_page);
    } catch (error) {
      console.error("Error fetching packages", error);
    } finally {
      setLoading(false);
    }
  };

  const addTokenPackage = async (payloadData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(payloadData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await API.post(`/resellers/token-packages`, formData, {
        headers: {
          "Content-Type": "multipart/formdata",
        },
      });
      //vehicletuning.test/api/resellers/token-packages

      toast.success(response?.data?.message || t("common.create.success"), {
        theme: "dark",
        autoClose: 2000,
      });
      setLogoName();
      getPackages();
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

  const fileName = (name) => {
    let file = name.split("/").pop();
    // return file;
    return file.length > 35 ? file.slice(0, 35) : file;
  };

  const updateTokenPackage = async (packageId, payloadData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(payloadData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await API.post(
        `/resellers/token-packages/${packageId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/formdata",
          },
        }
      );
      if (response.data.success) {
        toast.success(response?.data?.message || t("common.update.success"), {
          theme: "dark",
          autoClose: 2000,
        });
        getPackages();
        closePopup();
      }
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
    getPackages();
  }, [search, page, perPage, sortBy, sortOrder]);

  useEffect(() => {
    if (formMode === "edit" && selectedPackage) {
      setFormValues({
        title: selectedPackage.title || "",
        tokens: selectedPackage.tokens || "",
        amount: selectedPackage.amount || "",
        vat: selectedPackage.vat || "",
      });
    } else {
      setFormValues({
        title: "",
        tokens: "",
        amount: "",
        vat: "",
      });
    }
  }, [formMode, selectedPackage]);

  const handleSort = (column) => {
    setSortBy(column);
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const openAddPopup = () => {
    setFormMode("add");
    setSelectedPackage(null);
    setShowPopup(true);
  };

  const openEditPopup = (pack) => {
    setFormMode("edit");
    setSelectedPackage(pack);
    setShowPopup(true);
  };

  const handleSubmit = () => {
    const payload = {
      title: formValues.title,
      tokens: formValues.tokens,
      amount: formValues.amount,
      vat: formValues.vat,
      image: logo ? logo : "",
      ...(formMode === "edit" && { reseller_id: id }),
    };

    if (formMode === "edit") {
      updateTokenPackage(selectedPackage.id, payload);
    } else {
      addTokenPackage(payload);
    }
  };

  const handleSingleDelete = async (packageId) => {
    if (!window.confirm("Are you sure you want to delete this package?"))
      return;

    try {
      await API.delete(`/resellers/token-packages/${packageId}`);
      toast.success(t("common.delete.success"), {
        theme: "dark",
        autoClose: 2000,
      });
      getPackages();
    } catch (error) {
      toast.error(error?.response?.data?.message || t("common.delete.error"), {
        theme: "dark",
        autoClose: 2000,
      });
    }
  };

  const fileInputRef = useRef(null);
  const [selectedFileType, setSelectedFileType] = useState(""); // "file" or "folder"
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);

  const triggerFileInput = (type) => {
    setSelectedFileType(type);
    if (fileInputRef.current) {
      // Remove attributes first
      fileInputRef.current.removeAttribute("webkitdirectory");
      fileInputRef.current.removeAttribute("directory");
      fileInputRef.current.removeAttribute("multiple");

      if (type === "folder") {
        fileInputRef.current.setAttribute("webkitdirectory", "");
        fileInputRef.current.setAttribute("directory", "");
      } else {
        fileInputRef.current.setAttribute("multiple", "");
      }
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    if (selectedFileType === "folder") {
      // Extract root folder name from first file path
      const firstPath = files[0]?.webkitRelativePath || "";
      const folderName = firstPath.split("/")[0];
      setSelectedNames([folderName]);
    } else {
      const fileNames = files.map((file) => file.name);
      setSelectedNames(fileNames);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFiles([]);
    setSelectedNames([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleLogoUpload = (event) => {
    setLogo(event.target.files[0]);
    setLogoName(event.target.files[0].name);
  };

  const handleCreatePackage = async () => {
    const payload = new formValues();
    payload.append("title", formValues.title);
    payload.append("tokens", formValues.tokens);
    payload.append("amount", formValues.amount);
    payload.append("vat", formValues.vat);

    if (selectedFiles && selectedFiles.length > 0 && selectedFiles[0]) {
      payload.append("image", selectedFiles[0]);
    }

    try {
      await API.post("/token-packages", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Package created successfully");
      setShowPopup(false);
      setFormValues({ title: "", tokens: "", amount: "", vat: "" });
      setSelectedFiles([]);
      setSelectedNames([]);
      fileInputRef.current.value = "";
    } catch (error) {
      alert(
        "Error: " + error.response?.data?.message || "Failed to create package."
      );
    }
  };

  return (
    <>
      <div className="fullWidth">
        <div className="main">
          <ResellerSidebar />
          <div className="container">
            <ResellerHeader pageTitle={t("reseller.price_list")} />
            <div className="mainInnerDiv">
              <div className="resellerFilter">
                <div className="searchFilter"></div>
                <div className="sortFilter">
                  <button className="addBtn" onClick={openAddPopup}>
                    {t("common.add_new")}
                  </button>
                </div>
              </div>

              <div className="resellerTable">
                <table className="custom-data-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th
                        onClick={() => handleSort("title")}
                        className={`sortable ${
                          sortBy === "title" ? sortOrder : ""
                        }`}
                      >
                        {t("common.title")}
                      </th>
                      <th
                        onClick={() => handleSort("tokens")}
                        className={`sortable ${
                          sortBy === "tokens" ? sortOrder : ""
                        }`}
                      >
                        {t("account.tokens")}
                      </th>
                      <th
                        onClick={() => handleSort("amount")}
                        className={`sortable ${
                          sortBy === "amount" ? sortOrder : ""
                        }`}
                      >
                        {t("billing.amount")}
                      </th>
                      <th>{t("billing.vat")}</th>
                      <th>{t("common.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="5"
                          style={{ textAlign: "center", padding: "20px" }}
                        >
                          {t("common.loading")}...
                        </td>
                      </tr>
                    ) : (
                      packages.map((pack) => (
                        <tr key={pack.id}>
                          <td>
                            <img
                              src={pack.image ? pack.image : coinImg}
                              alt=""
                              width={32}
                              style={{ borderRadius: "20px" }}
                            />
                          </td>
                          <td>{pack.title}</td>
                          <td>{pack.tokens}</td>
                          <td>{pack.amount}€</td>
                          <td>{pack.vat}%</td>
                          <td>
                            <button
                              className="viewBtn"
                              onClick={() => openEditPopup(pack)}
                            >
                              {t("common.edit")}
                            </button>
                            <button
                              className="trashBtn"
                              onClick={() => handleSingleDelete(pack.id)}
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
              <div className="popupContent2 popPackage">
                <div className="popupHeader">
                  <h2>{formMode == "add" ? "Add Package" : "Edit Package"}</h2>
                  <img
                    src={CrossIcon}
                    alt=""
                    className="closeBtn"
                    onClick={() => {
                      closePopup();
                      setLogoName();
                    }}
                  />
                </div>

                <div className="resellerForm addNewPopup">
                  <ul>
                    <li>
                      <label>Title*</label>
                      <input
                        type="text"
                        name="title"
                        value={formValues.title}
                        onChange={handleChange}
                        placeholder="Enter package title"
                      />
                    </li>
                    <li>
                      <label>Image</label>
                      {/* <div className="customUpload"> */}
                      {/* <span className="uploadLabel">Upload Image</span> */}

                      {/* {selectedNames.length > 0 && (
                            <div className="selectedFiles">
                              {selectedNames.map((name, idx) => (
                                <div key={idx} className="fileName">
                                  {name}
                                </div>
                              ))}
                            </div>
                          )} */}

                      {/* {selectedNames.length > 0 && (
                            <button
                              className="iconBtn delete"
                              onClick={handleRemoveFile}
                            >
                              <img src={TrashIcon} alt="Delete" />
                            </button>
                          )} */}

                      {/* <button
                            className="iconBtn add"
                            onClick={() => triggerFileInput("file")}
                          >
                            <img src={PlusIcon} alt="Add File" />
                          </button> */}

                      {/* <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                            accept="image/*"
                          /> */}
                      {/* </div> */}
                      <div
                        className="customUpload"
                        style={{
                          cursor: imageUploadLoader ? "not-allowed" : "cursor",
                        }}
                      >
                        {imageUploadLoader ? (
                          <>
                            <img
                              src={loaderImg}
                              alt="Profile Preview"
                              style={{ width: "77px", height: "46px" }}
                            />
                            <p
                              style={{
                                marginTop: "0px",
                                marginLeft: "-26px",
                              }}
                            >
                              uploading...
                            </p>
                          </>
                        ) : (
                          <>
                            <span className="uploadLabel">
                              {logoName
                                ? logoName
                                : selectedPackage?.image
                                ? fileName(selectedPackage?.image)
                                : "Upload Image"}
                            </span>
                            <button
                              className="iconBtn add"
                              onClick={() => triggerFileInput("file")}
                            >
                              <img src={PlusIcon} alt="Add File" />
                            </button>

                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleLogoUpload}
                              style={{ display: "none" }}
                            />
                          </>
                        )}
                      </div>
                    </li>

                    <li>
                      <label>Tokens</label>
                      <input
                        type="number"
                        name="tokens"
                        value={formValues.tokens}
                        onChange={handleChange}
                        placeholder="0"
                      />
                    </li>
                    <li>
                      <label>Total (Excl. Tax)</label>
                      <input
                        type="number"
                        name="amount"
                        value={formValues.amount}
                        onChange={handleChange}
                        placeholder="0"
                      />
                    </li>
                    <li>
                      <label>VAT rate (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="vat"
                        value={formValues.vat}
                        onChange={handleChange}
                        placeholder="0"
                      />
                    </li>
                  </ul>

                  <div className="popBtns">
                    <button
                      type="submit"
                      className="saveBtn"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      style={{
                        opacity: isSubmitting ? "0.5" : "1",
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                      }}
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
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ResellerTokenPackages;
