// src/pages/admin/News.jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Sidebar from "../../layouts/Sidebar";
import Header from "../../layouts/AdminHeader";
import TableFooter from "../../layouts/TableFooter";
import API from "../../api/axios";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { warningImg, CrossIcon } from "@/assets/images";

const News = () => {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [list, setList] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    const [reqId, setReqId] = useState(null);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [delLoading, setDelLoading] = useState(false);

    const [formMode, setFormMode] = useState("add");
    const [selectedItem, setSelectedItem] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        excerpt: "",
        body: "",
        image: null,
        published_at: "",
        is_published: false,
        source: "", // <-- added
    });

    const handleFileChange = (e) => {
        setFormData(p => ({ ...p, image: e.target.files[0] }));
    };

    const openAddPopup = () => {
        setFormMode("add"); setSelectedItem(null);
        setFormData({ title: "", excerpt: "", body: "", image: null, published_at: "", is_published: false, source: "" });
        setShowPopup(true);
    };

    const openEditPopup = (item) => {
        setFormMode("edit"); setSelectedItem(item);
        setFormData({
            title: item.title || "",
            excerpt: item.excerpt || "",
            body: item.body || "",
            image: null,
            published_at: item.published_at || "",
            is_published: !!item.is_published,
            source: item.source || "", // <-- populate when editing
        });
        setShowPopup(true);
    };

    const closePopup = () => setShowPopup(false);

    const getList = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/admin/news", { params: { search: searchTerm, page, per_page: perPage } });
            setList(data?.data?.news || data?.data || []);
            setTotalRecords(data?.data?.total || 0);
        } catch (err) {
            console.error(err); setList([]);
        } finally { setLoading(false); }
    };

    const handleDelete = (id) => { setReqId(id || null); setOpenDeleteModal(true); };

    const handleConfirmDelete = async () => {
        try {
            setDelLoading(true);
            const response = await API.delete(`/admin/news/${reqId}`);
            if (response?.data?.success) {
                toast.success(response.data.message || t("common.delete.success"));
                getList(); setReqId(null); setOpenDeleteModal(false);
            } else toast.error(t("common.delete.error"));
        } catch (err) { console.error(err); toast.error(t("common.delete.error")); } finally { setDelLoading(false); }
    };

    const submitForm = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("title", formData.title);
            fd.append("excerpt", formData.excerpt);
            fd.append("body", formData.body);
            if (formData.image) fd.append("image", formData.image);
            if (formData.published_at) fd.append("published_at", formData.published_at);
            fd.append("is_published", formData.is_published ? 1 : 0);
            // append source if provided (allow empty string if you want)
            if (formData.source) {
                fd.append("source", formData.source);
            } else {
                // if your backend expects explicit null/empty, you can still send empty string
                fd.append("source", "");
            }

            let response;
            if (formMode === "edit" && selectedItem) {
                response = await API.post(`/admin/news/${selectedItem.id}`, fd, { headers: { "Content-Type": "multipart/form-data", "X-HTTP-Method-Override": "PUT" } });
            } else {
                response = await API.post("/admin/news", fd, { headers: { "Content-Type": "multipart/form-data" } });
            }

            toast.success(response?.data?.message || t("common.save_success"), { theme: "dark", autoClose: 2000 });
            getList(); closePopup();
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || t("common.save_error"), { theme: "dark", autoClose: 2000 });
        } finally { setIsSubmitting(false); }
    };

    useEffect(() => { getList(); }, [searchTerm, page, perPage]);

    return (
        <div className="main">
            <Sidebar />
            <Header pageTitle={t("news.plural")} />
            <div className="container">
                <div className="dashboard-container">
                    <div className="table-container">
                        <div className="table-header">
                            <div className="table-header__top">
                                <div className="table-header__title-wrap">
                                    <h3 className="table-title">{t("news.plural")}</h3>
                                </div>

                                <div>
                                    <button className="btn btn-primary" onClick={openAddPopup}>
                                        {t("common.add")}
                                    </button>
                                </div>
                            </div>
                            <div className="table-header__bottom">
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder={t("common.search_placeholder")}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>{t("news.title")}</th>
                                        <th>{t("news.excerpt")}</th>
                                        <th>{t("news.published_at")}</th>
                                        <th>{t("news.source")}</th> {/* new column */}
                                        <th>{t("common.actions")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="5">{t("common.loading")}...</td></tr>
                                    ) : list.length ? list.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.title}</td>
                                            <td>{item.excerpt}</td>
                                            <td>{item.published_at}</td>
                                            <td>
                                                {item.source ? (
                                                    <a href={item.source} target="_blank" rel="noopener noreferrer">
                                                        {item.source}
                                                    </a>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                            <td>
                                                {/* Edit left commented intentionally; uncomment if needed */}
                                                <button className="btn-action" onClick={() => openEditPopup(item)}>{t("common.edit")}</button>
                                                <button className="btn-action btn-trash" onClick={() => handleDelete(item.id)}>{t("common.delete")}</button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={5} style={{ textAlign: "center" }}>{t("common.result.no_record")}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <TableFooter page={page} perPage={perPage} totalRecords={totalRecords} onPageChange={setPage} onPerPageChange={setPerPage} />
                    </div>

                    {showPopup && (
                        <div className="popup-overlay">
                            <div className="popup-container modal-lg">
                                <div className="popup-header">
                                    <h2>{formMode === "edit" ? `${t("common.edit")} ${t("news.singular")}` : `${t("common.add")} ${t("news.singular")}`}</h2>
                                    <img src={CrossIcon} alt="" className="popup-close" onClick={closePopup} />
                                </div>
                                <form onSubmit={submitForm}>
                                    <div className="popup-body">
                                        <div className="form-container">
                                            <ul className="form-row">
                                                <li>
                                                    <label>{t("news.title")}</label>
                                                    <input
                                                        type="text"
                                                        name="title"
                                                        className="form-control"
                                                        placeholder={t("common.enter_placeholder")}
                                                        value={formData.title}
                                                        onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                                                    />
                                                </li>

                                                <li>
                                                    <label>{t("news.excerpt")}</label>
                                                    <input
                                                        type="text"
                                                        name="excerpt"
                                                        className="form-control"
                                                        placeholder={t("common.enter_placeholder")}
                                                        value={formData.excerpt}
                                                        onChange={(e) => setFormData(p => ({ ...p, excerpt: e.target.value }))}
                                                    />
                                                </li>

                                                <li>
                                                    <label>{t("news.body")}</label>
                                                    <textarea
                                                        name="body"
                                                        className="form-control"
                                                        placeholder={t("common.enter_placeholder")}
                                                        value={formData.body}
                                                        onChange={(e) => setFormData(p => ({ ...p, body: e.target.value }))}
                                                    />
                                                </li>

                                                <li>
                                                    <label>{t("news.image")}</label>
                                                    <input type="file" accept="image/*" onChange={handleFileChange} />
                                                </li>

                                                <li>
                                                    <label>{t("news.source")}</label>
                                                    <input
                                                        type="url"
                                                        name="source"
                                                        className="form-control"
                                                        placeholder={t("common.enter_placeholder") || "https://example.com"}
                                                        value={formData.source}
                                                        onChange={(e) => setFormData(p => ({ ...p, source: e.target.value }))}
                                                    />
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="popup-footer">
                                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                            {isSubmitting ? <CircularProgress size={20} style={{ color: "#0f4166" }} /> : t("common.save")}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* <Modal open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
                        <Box className="modal-box warning-modal-box" sx={{ height: 400, width: 445 }}>
                            <div className="modal-body">
                                <img src={warningImg} alt="Warning" />
                                <h3>{t("common.delete")}!</h3>
                                <p>{t("news.delete_confirm")}</p>
                                <div className="modal-btn-group">
                                    <button type="button" className="black-btn" disabled={delLoading} onClick={handleConfirmDelete}>
                                        {delLoading ? <CircularProgress size={25} style={{ color: "white" }} /> : t("common.delete")}
                                    </button>
                                    <button type="button" className="white-btn" onClick={() => setOpenDeleteModal(false)}>{t("common.cancel")}</button>
                                </div>
                            </div>
                        </Box>
                    </Modal> */}
                    {/* delete modal */}
                    {openDeleteModal && (
                        <div
                            className="popup-overlay"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="delete-title"
                        >
                            <div className="popup-container modal-sm warning-modal-box">

                                {/* Header */}
                                <div className="popup-header">
                                    <h2 id="delete-title">{t("common.delete")}!</h2>

                                    <img
                                        src={CrossIcon}
                                        alt="close"
                                        className="popup-close"
                                        onClick={() => setOpenDeleteModal(false)}
                                    />
                                </div>

                                {/* Body */}
                                <div className="popup-body">
                                    <div className="form-container" style={{ textAlign: "center" }}>
                                        <img
                                            src={warningImg}
                                            alt="Warning"
                                            style={{ width: 64, marginBottom: 15 }}
                                        />

                                        <p>
                                            {t("salary_slips.delete_confirm") || t("common.delete_confirm")}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="popup-footer">
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        disabled={delLoading}
                                        onClick={handleConfirmDelete}
                                    >
                                        {delLoading ? (
                                            <CircularProgress size={20} />
                                        ) : (
                                            t("common.delete")
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setOpenDeleteModal(false)}
                                    >
                                        {t("common.cancel")}
                                    </button>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default News;
