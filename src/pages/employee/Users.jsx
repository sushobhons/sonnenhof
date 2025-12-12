// src/pages/admin/Users.jsx
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

const Users = () => {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [list, setList] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    const [selectedIds, setSelectedIds] = useState([]);
    const [reqId, setReqId] = useState(null);

    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [delLoading, setDelLoading] = useState(false);

    const [formMode, setFormMode] = useState("add"); // add | edit
    const [selectedItem, setSelectedItem] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Options
    const [groups, setGroups] = useState([]);
    const [positions, setPositions] = useState([]);
    const [floors, setFloors] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        gender: "",
        position: "",
        group_id: "",
        position_id: "",
        floor_id: "",
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const openAddPopup = () => {
        setFormMode("add");
        setSelectedItem(null);
        setFormData({
            name: "",
            email: "",
            gender: "",
            position: "",
            group_id: "",
            position_id: "",
            floor_id: "",
        });
        setShowPopup(true);
    };

    const openEditPopup = (item) => {
        setFormMode("edit");
        setSelectedItem(item);
        setFormData({
            name: item.name || "",
            email: item.email || "",
            gender: item.gender ?? "",
            position: item.position || "",
            group_id: item.group_id ?? item.group?.id ?? item.group_id ?? "",
            position_id: item.position_id ?? item.position?.id ?? item.position_id ?? "",
            floor_id: item.floor_id ?? item.floor?.id ?? item.floor_id ?? "",
        });
        setShowPopup(true);
    };

    const closePopup = () => setShowPopup(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // basic validation
        if (!formData.name?.trim()) {
            toast.error(t("common.validation.required"));
            return;
        }
        if (!formData.email?.trim()) {
            toast.error(t("common.validation.required"));
            return;
        }

        if (formMode === "edit" && selectedItem) {
            await updateItem(selectedItem.id, formData);
        } else {
            await addItem(formData);
        }
    };

    const handleDelete = (id) => {
        setReqId(id || null);
        setOpenDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setDelLoading(true);
            let response;
            if (reqId) {
                response = await API.delete(`/admin/users/${reqId}`);
            } else {
                response = await API.post(`/admin/users/delete`, { ids: selectedIds });
            }
            if (response?.data?.success) {
                toast.success(response?.data?.message || t("common.delete.success"), { theme: "dark", autoClose: 2000 });
                getList();
                setSelectedIds([]);
                setReqId(null);
                setOpenDeleteModal(false);
            } else {
                toast.error(t("common.delete.error"), { theme: "dark", autoClose: 2000 });
            }
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error(error?.response?.data?.message || t("common.delete.error"), { theme: "dark", autoClose: 2000 });
        } finally {
            setDelLoading(false);
        }
    };

    /* API */
    const getList = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/admin/users", {
                params: {
                    search: searchTerm,
                    page,
                    per_page: perPage,
                    sort_by: sortBy,
                    sort_order: sortOrder,
                },
            });
            setList(data?.data?.users || data?.data || []);
            setTotalPages(data?.data?.last_page || 1);
            setTotalRecords(data?.data?.total || 0);
        } catch (error) {
            console.error("Error fetching users:", error);
            setList([]);
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (payload) => {
        setIsSubmitting(true);
        try {
            const response = await API.post("/admin/users", payload);
            toast.success(response?.data?.message || t("common.create.success"), { theme: "dark", autoClose: 2000 });
            getList();
            closePopup();
        } catch (error) {
            console.error("Create error:", error);
            toast.error(error?.response?.data?.message || t("common.create.error"), { theme: "dark", autoClose: 2000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateItem = async (id, payload) => {
        setIsSubmitting(true);
        try {
            const response = await API.put(`/admin/users/${id}`, payload);
            toast.success(response?.data?.message || t("common.update.success"), { theme: "dark", autoClose: 2000 });
            getList();
            closePopup();
        } catch (error) {
            console.error("Update error:", error);
            toast.error(error?.response?.data?.message || t("common.update.error"), { theme: "dark", autoClose: 2000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    const loadSelectOptions = async () => {
        try {
            const [gRes, pRes, fRes] = await Promise.all([
                API.get("/admin/groups", { params: { per_page: 1000 } }),
                API.get("/admin/positions", { params: { per_page: 1000 } }),
                API.get("/admin/floors", { params: { per_page: 1000 } }),
            ]);

            const gList = gRes?.data?.data?.groups || gRes?.data?.data || [];
            const pList = pRes?.data?.data?.positions || pRes?.data?.data || [];
            const fList = fRes?.data?.data?.floors || fRes?.data?.data || [];

            setGroups(gList);
            setPositions(pList);
            setFloors(fList);
        } catch (err) {
            console.error("Error loading select options:", err);
            // silently fail — options will be empty
        }
    };

    useEffect(() => {
        getList();
        loadSelectOptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, page, perPage, sortBy, sortOrder]);

    return (
        <div className="main">
            <Sidebar />
            <Header pageTitle={t("users.plural")} />
            <div className="container">
                <div className="dashboard-container">
                    <div className="table-container">
                        <div className="table-header">
                            <div className="table-header__top">
                                <div className="table-header__title-wrap">
                                    <h3 className="table-title">{t("users.plural")}</h3>
                                </div>

                                <div>
                                    <button className="btn btn-primary" onClick={openAddPopup}>
                                        {t("common.add")}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>{t("users.name")}</th>
                                        <th>{t("users.email")}</th>
                                        <th>{t("users.gender")}</th>
                                        <th>{t("groups.singular")}</th>
                                        <th>{t("positions.singular")}</th>
                                        <th>{t("floors.singular")}</th>
                                        <th>{t("common.actions")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="loading-cell">{t("common.loading")}...</td>
                                        </tr>
                                    ) : list.length > 0 ? (
                                        list.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.name}</td>
                                                <td>{item.email}</td>
                                                <td>{item.gender ?? "-"}</td>
                                                <td>{item.group?.name ?? "-"}</td>
                                                <td>{item.position?.name ?? "-"}</td>
                                                <td>{item.floor?.name ?? "-"}</td>
                                                <td>
                                                    <button className="btn-action btn-view" onClick={() => openEditPopup(item)}>{t("common.edit")}</button>
                                                    <button className="btn-action btn-trash" onClick={() => handleDelete(item.id)}>{t("common.delete")}</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={6} style={{ textAlign: "center" }}>{t("common.result.no_record")}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <TableFooter page={page} perPage={perPage} totalRecords={totalRecords} onPageChange={setPage} onPerPageChange={setPerPage} />
                    </div>

                    {/* add/edit popup */}
                    {showPopup && (
                        <div className="popup-overlay">
                            <div className="popup-container modal-md">
                                <div className="popup-header">
                                    <h2>{formMode === "edit" ? `${t("common.edit")} ${t("users.singular")}` : `${t("common.add")} ${t("users.singular")}`}</h2>
                                    <img src={CrossIcon} alt="" className="popup-close" onClick={closePopup} />
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="popup-body">
                                        <div className="form-container">
                                            <ul className="form-row">
                                                <li>
                                                    <label>{t("users.name")}</label>
                                                    <input type="text" name="name" className="form-control" placeholder={t("common.enter_placeholder")} value={formData.name} onChange={handleChange} />
                                                </li>

                                                <li>
                                                    <label>{t("users.email")}</label>
                                                    <input type="email" name="email" className="form-control" placeholder={t("common.enter_placeholder")} value={formData.email} onChange={handleChange} />
                                                </li>
                                                <li>
                                                    <label>{t("users.gender")}</label>
                                                    <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                                                        <option value="">{t("common.select") || "Select"}</option>
                                                        <option value="male">{t("male") || "Male"}</option>
                                                        <option value="female">{t("female") || "Female"}</option>
                                                        <option value="other">{t("other") || "Other"}</option>
                                                    </select>
                                                </li>
                                                <li>
                                                    <label>{t("groups.singular")}</label>
                                                    <select name="group_id" className="form-control" value={formData.group_id} onChange={handleChange}>
                                                        <option value="">{t("common.select")}</option>
                                                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                                    </select>
                                                </li>

                                                <li>
                                                    <label>{t("positions.singular")}</label>
                                                    <select name="position_id" className="form-control" value={formData.position_id} onChange={handleChange}>
                                                        <option value="">{t("common.select")}</option>
                                                        {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                    </select>
                                                </li>

                                                <li>
                                                    <label>{t("floors.singular")}</label>
                                                    <select name="floor_id" className="form-control" value={formData.floor_id} onChange={handleChange}>
                                                        <option value="">{t("common.select")}</option>
                                                        {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                                    </select>
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
                                        <img src={warningImg} alt="Warning" style={{ width: 64, marginBottom: 15 }} />
                                        <p id="delete-user-description" style={{ marginBottom: 0 }}>{t("users.delete_confirm")}</p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="popup-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                                    <button type="button" className="btn btn-danger" disabled={delLoading} onClick={handleConfirmDelete}>
                                        {delLoading ? <CircularProgress size={20} /> : t("common.delete")}
                                    </button>

                                    <button type="button" className="btn btn-secondary" onClick={() => { setOpenDeleteModal(false); setReqId(null); }}>
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

export default Users;
