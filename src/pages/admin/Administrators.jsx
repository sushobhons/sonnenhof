// 1. React & Hooks
import { useEffect, useState } from "react";

// 2. Third-party libraries
import ReactQuill from "react-quill";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";
import { Modal, Box } from "@mui/material";
// 3. Styles
import "react-quill/dist/quill.snow.css";

// 4. Utilities & APIs
import API from "../../api/axios";
import { useTranslation } from "react-i18next";

// 5. Layout Components (alias imports)
import AdminSidebar from "@layouts/AdminSidebar";
import Header from "@layouts/AdminHeader";
import TableFooter from "@layouts/TableFooter";

// 6. Assets (icons, images, etc.)
import { CrossIcon, defaultProfileImg } from "@/assets/images";
import warningImg from "../../assets/images/warning-img.png";

function AdminAdministrators() {
  const imgUrl = import.meta.env.VITE_IMG_URL;
  const getInitialPerPage = () => {
    const height = window.innerHeight;
    if (height >= 1440) return 100;
    else if (height >= 1080) return 50;
    else if (height >= 800) return 25;
    else return 10;
  };

  const [perPage, setPerPage] = useState(getInitialPerPage());
  const publicUrl = import.meta.env.VITE_PUBLIC_URL;
  //const [editorContent, setEditorContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [administrators, setAdministrators] = useState([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    notes: "",
  });
  const [showPopup, setShowPopup] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const { t } = useTranslation();
  const [reqId, setReqId] = useState();
  const [open, setOpen] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  useEffect(() => {
    if (formMode === "edit" && selectedAdmin) {
      setFormData({
        name: selectedAdmin.name || "",
        username: selectedAdmin.username || "",
        email: selectedAdmin.email || "",
        password: "",
        password_confirmation: "",
        notes: selectedAdmin.notes || "",
      });
    } else {
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        password_confirmation: "",
        notes: "",
      });
    }
  }, [formMode, selectedAdmin]);

  useEffect(() => {
    getAdministrators();
  }, [search, page, perPage, sortBy, sortOrder]);

  const getAdministrators = async () => {
    try {
      setLoading(true);
      const response = await API.get("/admin/administrators", {
        params: {
          search,
          page,
          perPage,
          sortBy,
          sortOrder,
        },
      });

      setAdministrators(response.data.data);
      setTotalPages(response.data.last_page);
      setTotalRecords(response.data.total);
    } catch (error) {
      console.error("Error fetching administrators", error);
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async (formData) => {
    setIsSubmitting(true);
    try {
      const response = await API.post(`/admin/administrators`, formData);
      toast.success(response?.data?.message || t("common.create.success"), {
        theme: "dark",
        autoClose: 2000,
      });
      getAdministrators();
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

  const updateAdmin = async (adminId, formData) => {
    setIsSubmitting(true);
    try {
      const response = await API.put(
        `/admin/administrators/${adminId}`,
        formData
      );
      toast.success(response?.data?.message || t("common.update.success"), {
        theme: "dark",
        autoClose: 2000,
      });
      getAdministrators();
    } catch (error) {
      toast.error(error?.response?.data?.message || t("common.update.error"), {
        theme: "dark",
        autoClose: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleCheckboxChange = (e, id) => {
  //   if (e.target.checked) {
  //     setSelectedIds((prev) => [...prev, id]);
  //   } else {
  //     setSelectedIds((prev) =>
  //       prev.filter((administratorId) => administratorId !== id)
  //     );
  //   }
  // };

  // const handleSelectAll = (e) => {
  //   if (e.target.checked) {
  //     setSelectedIds(administrators.map((r) => r.id));
  //   } else {
  //     setSelectedIds([]);
  //   }
  // };

  // const handleDelete = async () => {
  //   if (!selectedIds.length) return;

  //   if (!window.confirm(t("reseller.delete_selected_confirm"))) return;

  //   try {
  //     await API.post(`/admin/administrators/delete`, { ids: selectedIds });
  //     getAdministrators();
  //     setSelectedIds([]);
  //   } catch (error) {
  //     toast.error(error?.response?.data?.message || t("common.delete.error"), {
  //       theme: "dark",
  //       autoClose: 2000,
  //     });
  //   }
  // };

  const handleDelete = (id) => {
    if (id) {
      setOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setDelLoading(true);
      const apiRes = await API.delete(`/admin/administrators/${reqId}`);
      if (apiRes?.data?.success) {
        toast.success(t("common.delete.success"), { duration: 2000 });
        setOpen(false);
        getAdministrators();
      } else {
        toast.error(t("common.delete.error"), { duration: 2000 });
      }
    } catch (error) {
      console.error("Delete request failed:", error);
    } finally {
      setDelLoading(false);
    }
  };

  const handleSort = (column) => {
    setSortBy(column);
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const openEditPopup = (administrator) => {
    setFormMode("edit");
    setSelectedAdmin(administrator);
    setShowPopup(true);
  };

  const openAddPopup = () => {
    setFormMode("add");
    setSelectedAdmin(null);
    setShowPopup(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (value) => {
    setFormData((prev) => ({ ...prev, notes: value }));
  };

  const handleSubmit = () => {
    if (formMode === "edit") {
      updateAdmin(selectedAdmin.id, formData);
    } else {
      addAdmin(formData);
    }
  };

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

  // const handleEditorChange = (value) => {
  //   setEditorContent(value);
  // };

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

  return (
    <div className="fullWidth">
      <div className="main">
        <AdminSidebar />
        <div className="container">
          <Header pageTitle={t("sidebar.administrators")} />
          <div className="mainInnerDiv">
            {/* <div className="dashTop">
              <h2>{t("sidebar.administrators")}</h2>
            </div> */}

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

                <button className="addBtn" onClick={openAddPopup}>
                  {t("common.add_new")}
                </button>
              </div>
            </div>

            <div className="resellerTable">
              <table className="custom-data-table">
                <thead>
                  <tr>
                    {/* <th>
                      <input type="checkbox" />
                    </th> */}
                    <th>{t("common.profile_pic")}</th>
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
                      onClick={() => handleSort("username")}
                      className={`sortable ${
                        sortBy === "username" ? sortOrder : ""
                      }`}
                    >
                      {t("common.username")}
                    </th>
                    <th
                      onClick={() => handleSort("email")}
                      className={`sortable ${
                        sortBy === "email" ? sortOrder : ""
                      }`}
                    >
                      {t("common.email")}
                    </th>
                    <th>{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="7"
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        {t("common.loading")}...
                      </td>
                    </tr>
                  ) : (
                    administrators.map((administrator) => (
                      <tr key={administrator.id}>
                        <td>
                          <img
                            src={
                              administrator.profile_pic
                                ? imgUrl + administrator.profile_pic
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
                        <td>{administrator.created_at}</td>
                        <td>{administrator.name}</td>
                        <td>{administrator.username}</td>
                        <td>{administrator.email}</td>
                        <td>
                          {/* <Link
                          to={`/admin/administrator-details/${administrator.id}`}
                          className="viewBtn"
                        >
                          {t("common.view")}
                        </Link> */}
                          <button
                            className="viewBtn"
                            onClick={() => openEditPopup(administrator)}
                          >
                            {t("common.view")}
                          </button>
                          <button
                            className="trashBtn"
                            onClick={() => {
                              handleDelete(administrator.id);
                              setReqId(administrator.id);
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
          </div>
        </div>

        {showPopup && (
          <div className="popupOverlay">
            <div className="popupContent3 popupAdminis">
              <div className="popupHeader">
                <h2>
                  {formMode === "edit"
                    ? "Edit Administrator"
                    : "Add Administrator"}
                </h2>
                <img
                  src={CrossIcon}
                  alt=""
                  className="closeBtn"
                  onClick={closePopup}
                />
              </div>

              <div className="adminisModalBody">
                <div className="resellerForm addNewPopup">
                  {/* <input type="email" name="email" style={{ display: "none" }} />
                <input
                  type="password"
                  name="password"
                  style={{ display: "none" }}
                /> */}
                  <ul>
                    <li>
                      <label>Display name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter name"
                      />
                    </li>
                    <li>
                      <label>Username</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Enter username"
                      />
                    </li>
                    <li>
                      <label>Email</label>
                      <input
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                        autoComplete="off"
                      />
                    </li>
                    <li>
                      <label>Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter password"
                        autoComplete="off"
                      />
                    </li>
                    <li>
                      <label>Confirm Password</label>
                      <input
                        type="password"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleInputChange}
                        placeholder="Confirm password"
                        autoComplete="off"
                      />
                    </li>
                  </ul>
                </div>

                <div className="messagesEditor">
                  <h2 className="notePopHdn">Notes</h2>
                  <ReactQuill
                    value={formData.notes}
                    onChange={handleEditorChange}
                    modules={modules}
                    formats={formats}
                    theme="snow"
                    placeholder=""
                  />
                  <button
                    type="submit"
                    className="saveBtn popupSaveBtn"
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
        )}
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
          style={{ height: "400px", width: "435px" }}
        >
          {/* <div className="modal-header">
                <button className="close-btn" onClick={()=>setConfirmOpen(false)}>
                <img src={modalCrossIcon} alt="" />
              </button> 
            </div> */}
          <div className="modal-body">
            <img src={warningImg} alt="" />
            <h3>{t("common.delete")}!</h3>
            <p>{t("admin.delete_single_confirm")}</p>

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
                      handleConfirmDelete();
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
  );
}

export default AdminAdministrators;
