// src/pages/Positions.jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/AdminHeader";
import TableFooter from "../layouts/TableFooter";
import API from "../api/axios";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { warningImg, CrossIcon } from "@/assets/images";

const Positions = () => {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [list, setList] = useState([]);

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    const [reqId, setReqId] = useState(null);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [delLoading, setDelLoading] = useState(false);

    const [showPopup, setShowPopup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formMode, setFormMode] = useState("add");
    const [selectedItem, setSelectedItem] = useState(null);

    const [formData, setFormData] = useState({ name: "" });

    const openAddPopup = () => { setFormMode("add"); setSelectedItem(null); setFormData({ name: "" }); setShowPopup(true); };
    const openEditPopup = (item) => { setFormMode("edit"); setSelectedItem(item); setFormData({ name: item.name || "" }); setShowPopup(true); };
    const closePopup = () => setShowPopup(false);

    const getList = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/admin/positions", { params: { page, per_page: perPage } });
            setList(data?.data?.positions || data?.data || []);
            setTotalRecords(data?.data?.total ?? 0);
        } catch (err) {
            console.error(err);
            setList([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => { setReqId(id); setOpenDeleteModal(true); };

    const handleConfirmDelete = async () => {
        try {
            setDelLoading(true);
            const resp = await API.delete(`/admin/positions/${reqId}`);
            if (resp?.data?.success) {
                toast.success(resp.data.message || t("common.delete.success"), { theme: "dark", autoClose: 2000 });
                getList();
                setOpenDeleteModal(false);
                setReqId(null);
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
        if (!formData.name?.trim()) { toast.error(t("common.validation.required")); return; }
        setIsSubmitting(true);
        try {
            const payload = { name: formData.name };
            let resp;
            if (formMode === "edit" && selectedItem) {
                resp = await API.put(`/admin/positions/${selectedItem.id}`, payload);
            } else {
                resp = await API.post("/admin/positions", payload);
            }
            toast.success(resp?.data?.message || t("common.save_success"), { theme: "dark", autoClose: 2000 });
            getList();
            closePopup();
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || t("common.save_error"), { theme: "dark", autoClose: 2000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => { getList(); }, [page, perPage]);

    return (
        <div className="main">
            <Sidebar />
            <Header pageTitle={t("positions.plural")} />
            <div className="container">
                <div className="dashboard-container">
                    <div className="table-container">
                        <div className="table-header">
                            <div className="table-header__top">
                                <div className="table-header__title-wrap">
                                    <h3 className="table-title">{t("positions.plural")}</h3>
                                </div>

                                <div>
                                    <button className="btn btn-primary" onClick={openAddPopup}>
                                        {t("common.add")} {t("positions.singular")}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr><th>ID</th>
                                        <th>{t("positions.name")}</th>
                                        {/* <th>Slug</th> */}
                                        <th>{t("common.actions")}</th></tr>
                                </thead>
                                <tbody>
                                    {loading ? <tr><td colSpan="4">{t("common.loading")}...</td></tr> : list.length ? list.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.id}</td>
                                            <td>{item.name}</td>
                                            {/* <td>{item.slug}</td> */}
                                            <td>
                                                <button className="btn-action btn-view" onClick={() => openEditPopup(item)}>{t("common.edit")}</button>
                                                <button className="btn-action btn-trash" onClick={() => handleDelete(item.id)}>{t("common.delete")}</button>
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan="4" style={{ textAlign: "center" }}>{t("common.result.no_record")}</td></tr>}
                                </tbody>
                            </table>
                        </div>

                        <TableFooter page={page} perPage={perPage} totalRecords={totalRecords} onPageChange={setPage} onPerPageChange={setPerPage} />
                    </div>

                    {showPopup && (
                        <div className="popup-overlay">
                            <div className="popup-container modal-md">
                                <div className="popup-header">
                                    <h2>{formMode === "edit" ? `${t("common.edit")} ${t("positions.singular")}` : `${t("common.add")} ${t("positions.singular")}`}</h2>
                                    <img src={CrossIcon} alt="close" className="popup-close" onClick={closePopup} />
                                </div>

                                <form onSubmit={submitForm}>
                                    <div className="popup-body">
                                        <div className="form-container">
                                            <ul className="form-row">
                                                <li>
                                                    <label>{t("positions.name")}</label>
                                                    <input type="text" name="name" className="form-control" placeholder={t("common.enter_placeholder")} value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="popup-footer">
                                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? <CircularProgress size={20} style={{ color: "#0f4166" }} /> : t("common.save")}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <Modal open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
                        <Box className="modal-box warning-modal-box" sx={{ height: 400, width: 445 }}>
                            <div className="modal-body">
                                <img src={warningImg} alt="Warning" />
                                <h3>{t("common.delete")}!</h3>
                                <p>{t("positions.delete_confirm")}</p>
                                <div className="modal-btn-group">
                                    <button type="button" className="black-btn" disabled={delLoading} onClick={handleConfirmDelete}>{delLoading ? <CircularProgress size={25} style={{ color: "white" }} /> : t("common.delete")}</button>
                                    <button type="button" className="white-btn" onClick={() => setOpenDeleteModal(false)}>{t("common.cancel")}</button>
                                </div>
                            </div>
                        </Box>
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default Positions;
