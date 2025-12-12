// src/pages/admin/SalarySlips.jsx
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

// Demo fallback file path provided in project history (will be transformed server-side)
const DEMO_FILE_FALLBACK = "/mnt/data/Employee.png";

const SalarySlips = () => {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [list, setList] = useState([]);

    // users for select
    const [users, setUsers] = useState([]);
    const [userFilter, setUserFilter] = useState(""); // optional filter

    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    const [reqId, setReqId] = useState(null);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [delLoading, setDelLoading] = useState(false);

    const [showPopup, setShowPopup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formMode, setFormMode] = useState("add"); // add | edit
    const [selectedItem, setSelectedItem] = useState(null);

    const [formData, setFormData] = useState({
        user_id: "",
        title: "",
        month: "",
        file: null,
    });

    // ---- fetch users for dropdown ----
    const getUsers = async () => {
        try {
            const { data } = await API.get("/admin/users", {
                params: { per_page: 1000 }, // fetch enough for dropdown; paginate if large
            });
            const usersData = data?.data?.users || data?.data || [];
            setUsers(usersData);
        } catch (err) {
            console.error("Error fetching users:", err);
            setUsers([]);
        }
    };

    useEffect(() => {
        // fetch users once (admin page)
        getUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---- handlers ----
    const openAddPopup = () => {
        setFormMode("add");
        setSelectedItem(null);
        setFormData({
            user_id: users.length > 0 ? users[0].id : "",
            title: "",
            month: "",
            file: null,
        });
        setShowPopup(true);
    };

    const openEditPopup = (item) => {
        setFormMode("edit");
        setSelectedItem(item);
        setFormData({
            user_id: item.user?.id ?? item.user_id ?? "",
            title: item.title || "",
            month: item.month ? item.month.substring(0, 7) : "", // yyyy-mm
            file: null,
        });
        setShowPopup(true);
    };

    const closePopup = () => setShowPopup(false);

    const handleFileChange = (e) => {
        setFormData((p) => ({ ...p, file: e.target.files[0] || null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // simple client-side validation
        if (!formData.user_id) {
            toast.error(t("users.validation.user_required") || "Please select a user", {
                theme: "dark",
            });
            return;
        }
        // if (!formData.title) {
        //     toast.error(t("users.validation.title_required") || "Title is required", {
        //         theme: "dark",
        //     });
        //     return;
        // }
        if (!formData.month) {
            toast.error(t("users.validation.month_required") || "Month is required", {
                theme: "dark",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const fd = new FormData();
            fd.append("user_id", formData.user_id);
            fd.append("title", formData.title);
            fd.append("month", formData.month);
            if (formData.file) fd.append("file", formData.file);

            let response;
            if (formMode === "edit" && selectedItem) {
                // Some backends accept POST + X-HTTP-Method-Override for PUT
                response = await API.post(`/admin/salary-slips/${selectedItem.id}`, fd, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "X-HTTP-Method-Override": "PUT",
                    },
                });
            } else {
                response = await API.post("/admin/salary-slips", fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            toast.success(response?.data?.message || t("common.save_success"), {
                theme: "dark",
                autoClose: 2000,
            });
            getList();
            closePopup();
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || t("common.save_error"), {
                theme: "dark",
                autoClose: 3000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        setReqId(id || null);
        setOpenDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setDelLoading(true);
            const response = await API.delete(`/admin/salary-slips/${reqId}`);
            if (response?.data?.success) {
                toast.success(response.data.message || t("common.delete.success"), {
                    theme: "dark",
                    autoClose: 2000,
                });
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

    // ---- API: get list (with optional user filter) ----
    const getList = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/admin/salary-slips", {
                params: {
                    search: searchTerm,
                    page,
                    per_page: perPage,
                    user_id: userFilter || undefined,
                },
            });

            // adapt to your backend response shape
            const payload = data?.data || {};
            setList(payload.salary_slips || payload || []);
            setTotalRecords(payload.total || 0);
        } catch (err) {
            console.error("Error fetching salary slips:", err);
            setList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, page, perPage, userFilter]);

    // ---- render ----
    return (
        <div className="main">
            <Sidebar />
            <Header pageTitle={t("salary_slips.plural") || t("salary.plural") || "Salary Slips"} />
            <div className="container">
                <div className="dashboard-container">
                    <div className="table-container">
                        <div className="table-header">
                            {/* first row: title (left) and add button (right) */}
                            <div className="table-header__top">
                                <div className="table-header__title-wrap">
                                    <h3 className="table-title" style={{ margin: 0 }}>{t("salary_slips.plural")}</h3>
                                </div>

                                <div>
                                    <button className="btn btn-primary" onClick={openAddPopup}>
                                        {t("common.add")}
                                    </button>
                                </div>
                            </div>

                            {/* second row: search + filters */}
                            <div className="table-header__bottom">
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder={t("common.search_placeholder")}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />

                                <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="select-input">
                                    <option value="">{t("users.plural") || "Users"}</option>
                                    {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>{t("users.name") || "User"}</th>
                                        <th>{t("users.email") || "User"}</th>
                                        <th>{t("salary_slips.month") || t("common.month")}</th>
                                        <th>{t("common.actions")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="loading-cell">
                                                {t("common.loading")}...
                                            </td>
                                        </tr>
                                    ) : list.length > 0 ? (
                                        list.map((item) => (
                                            <tr key={item.id}>
                                                {/* <td>{item.title}</td> */}
                                                <td>{item.user?.name ?? "-"}</td>
                                                <td>{item.user?.email ?? "-"}</td>
                                                <td>{item.month ? item.month : "-"}</td>
                                                {/* <td>{item.paid_on ? new Date(item.paid_on).toLocaleDateString() : "-"}</td> */}
                                                <td>
                                                    {item.file_url || item.file_path ? (
                                                        <a
                                                            href={item.file_url || item.file_path || DEMO_FILE_FALLBACK}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="btn-action btn-view"
                                                        >
                                                            {t("common.download")}
                                                        </a>
                                                    ) : null}
                                                    {/* <button className="btn-action btn-view" onClick={() => openEditPopup(item)}>
                                                        {t("common.edit")}
                                                    </button> */}
                                                    <button className="btn-action btn-trash" onClick={() => handleDelete(item.id)}>
                                                        {t("common.delete")}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: "center" }}>
                                                {t("common.result.no_record")}
                                            </td>
                                        </tr>
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
                                    <h2>
                                        {formMode === "edit"
                                            ? `${t("common.edit")} ${t("salary_slips.singular") || t("salary.singular")}`
                                            : `${t("common.add")} ${t("salary_slips.singular") || t("salary.singular")}`}
                                    </h2>
                                    <img src={CrossIcon} alt="" className="popup-close" onClick={closePopup} />
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="popup-body">
                                        <div className="form-container">
                                            <ul className="form-row">
                                                {/* user select */}
                                                <li>
                                                    <label>{t("users.name")}</label>
                                                    <select
                                                        name="user_id"
                                                        className="form-control"
                                                        value={formData.user_id}
                                                        onChange={(e) => setFormData((p) => ({ ...p, user_id: e.target.value }))}
                                                    >
                                                        <option value="">{t("common.select") || "Select user"}</option>
                                                        {users.map((u) => (
                                                            <option key={u.id} value={u.id}>
                                                                {u.name} ({u.email})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </li>

                                                {/* <li>
                                                    <label>{t("salary_slips.title") || t("common.title")}</label>
                                                    <input
                                                        type="text"
                                                        name="title"
                                                        className="form-control"
                                                        placeholder={t("common.enter_placeholder")}
                                                        value={formData.title}
                                                        onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                                                    />
                                                </li> */}

                                                <li>
                                                    <label>{t("salary_slips.month") || t("common.month")}</label>
                                                    <input
                                                        type="month"
                                                        name="month"
                                                        className="form-control"
                                                        value={formData.month}
                                                        onChange={(e) => setFormData((p) => ({ ...p, month: e.target.value }))}
                                                    />
                                                </li>

                                                <li>
                                                    <label>{t("salary_slips.file") || t("common.file")}</label>
                                                    <input type="file" accept=".pdf" onChange={handleFileChange} />
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="popup-footer">
                                        <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                                            {isSubmitting ? <CircularProgress size={20} style={{ color: "#0f4166" }} /> : t("common.save")}
                                        </button>
                                        <button type="button" className="btn btn-secondary" onClick={closePopup} style={{ marginLeft: 8 }}>
                                            {t("common.cancel")}
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

export default SalarySlips;
