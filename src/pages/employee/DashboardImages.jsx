// src/pages/admin/DashboardImages.jsx
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

const DashboardImages = () => {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [list, setList] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(12);
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
        image: null,
        position: 0,
        is_active: true,
    });

    const handleFileChange = (e) => {
        setFormData((p) => ({ ...p, image: e.target.files[0] }));
    };

    const openAddPopup = () => {
        setFormMode("add");
        setSelectedItem(null);
        setFormData({ title: "", image: null, position: 0, is_active: true });
        setShowPopup(true);
    };

    const openEditPopup = (item) => {
        setFormMode("edit");
        setSelectedItem(item);
        setFormData({ title: item.title || "", image: null, position: item.position || 0, is_active: !!item.is_active });
        setShowPopup(true);
    };

    const closePopup = () => setShowPopup(false);

    const getList = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/admin/dashboard-images", {
                params: { search: searchTerm, page, per_page: perPage },
            });
            setList(data?.data?.dashboard_images || data?.data || []);
            setTotalRecords(data?.data?.total || 0);
        } catch (err) {
            console.error(err);
            setList([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        setReqId(id || null);
        setOpenDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setDelLoading(true);
            const response = await API.delete(`/admin/dashboard-images/${reqId}`);
            if (response?.data?.success) {
                toast.success(response.data.message || t("common.delete.success"));
                getList();
                setReqId(null);
                setOpenDeleteModal(false);
            } else {
                toast.error(t("common.delete.error"), { theme: "dark", autoClose: 2000 });
            }
        } catch (err) {
            console.error(err);
            toast.error(t("common.delete.error"), { theme: "dark", autoClose: 2000 });
        } finally {
            setDelLoading(false);
        }
    };

    const submitForm = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("title", formData.title);
            if (formData.image) fd.append("image", formData.image);
            fd.append("position", formData.position);
            fd.append("is_active", formData.is_active ? 1 : 0);

            let response;
            if (formMode === "edit" && selectedItem) {
                response = await API.post(`/admin/dashboard-images/${selectedItem.id}`, fd, {
                    headers: { "Content-Type": "multipart/form-data", "X-HTTP-Method-Override": "PUT" },
                });
            } else {
                response = await API.post("/admin/dashboard-images", fd, { headers: { "Content-Type": "multipart/form-data" } });
            }

            toast.success(response?.data?.message || t("common.save_success"), { theme: "dark", autoClose: 2000 });
            getList();
            closePopup();
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || t("common.save_error"), { theme: "dark", autoClose: 2000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        getList();
    }, [searchTerm, page, perPage]);

    return (
        <div className="main">
            <Sidebar />
            <Header pageTitle={t("dashboard_images.plural")} />
            <div className="container">
                <div className="dashboard-container">
                    <div className="table-container">
                        <div className="table-header">
                            <div className="table-header__top">
                                <div className="table-header__title-wrap">
                                    <h3 className="table-title">{t("dashboard_images.plural")}</h3>
                                </div>

                                <div>
                                    <button className="btn btn-primary" onClick={openAddPopup}>
                                        {t("common.add")}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid-wrapper">
                            {loading ? (
                                <div>{t("common.loading")}...</div>
                            ) : list.length ? (
                                list.map((item) => (
                                    <div key={item.id} className="image-card">
                                        <div className="image-box">
                                            <img src={item.image_url || item.image_path} alt={item.title} />
                                        </div>
                                        <div className="card-body">
                                            <h4>{item.title}</h4>
                                            <div className="card-actions">
                                                {/* <button className="btn-action" onClick={() => openEditPopup(item)}>{t("common.edit")}</button> */}
                                                <button type="button"
                                                    className="btn btn-danger" onClick={() => handleDelete(item.id)}>{t("common.delete")}</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div>{t("common.result.no_record")}</div>
                            )}
                        </div>


                    </div>

                    {/* popup */}
                    {showPopup && (
                        <div className="popup-overlay">
                            <div className="popup-container modal-md">
                                <div className="popup-header">
                                    <h2>{formMode === "edit" ? `${t("common.edit")} ${t("dashboard_images.singular")}` : `${t("common.add")} ${t("dashboard_images.singular")}`}</h2>
                                    <img src={CrossIcon} alt="" className="popup-close" onClick={closePopup} />
                                </div>

                                <form onSubmit={submitForm}>
                                    <div className="popup-body">
                                        <div className="form-container">
                                            <ul className="form-row">
                                                <li>
                                                    <label>{t("dashboard_images.title")}</label>
                                                    <input type="text" name="title" className="form-control" placeholder={t("common.enter_placeholder")} value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} />
                                                </li>
                                                <li>
                                                    <label>{t("dashboard_images.image")}</label>
                                                    <input type="file" name="image" accept="image/*" onChange={handleFileChange} />
                                                </li>
                                                {/* <li>
                                                    <label>{t("dashboard_images.position")}</label>
                                                    <input type="number" name="position" className="form-control" value={formData.position} onChange={(e) => setFormData(p => ({ ...p, position: e.target.value }))} />
                                                </li>
                                                <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <label>{t("dashboard_images.is_active")}</label>
                                                    <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData(p => ({ ...p, is_active: e.target.checked }))} />
                                                </li> */}
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

                    {/* delete modal */}


                    {/* delete modal */}
                    {openDeleteModal && (
                        <div
                            className="popup-overlay"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="delete-user-title"
                            aria-describedby="delete-user-description"
                        >
                            <div className="popup-container modal-sm warning-modal-box">

                                {/* Header */}
                                <div className="popup-header">
                                    <h2 id="delete-user-title">{t("common.delete")}!</h2>
                                    <img
                                        src={CrossIcon}
                                        alt="close"
                                        className="popup-close"
                                        onClick={() => {
                                            setOpenDeleteModal(false);
                                            setReqId(null);
                                        }}
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

                                        <p id="delete-user-description" style={{ marginBottom: 0 }}>
                                            {t("dashboard_images.delete_confirm")}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="popup-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
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
                                        onClick={() => {
                                            setOpenDeleteModal(false);
                                            setReqId(null);
                                        }}
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

export default DashboardImages;
