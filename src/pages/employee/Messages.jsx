// src/pages/admin/Messages.jsx
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

const Messages = () => {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [list, setList] = useState([]);

    // selects/options
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [positions, setPositions] = useState([]);
    const [floors, setFloors] = useState([]);

    // header filters
    const [searchTerm, setSearchTerm] = useState("");
    const [userFilter, setUserFilter] = useState("");
    const [groupFilter, setGroupFilter] = useState("");
    const [positionFilter, setPositionFilter] = useState("");
    const [floorFilter, setFloorFilter] = useState("");

    // pagination
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    // sorting (default: created_at desc)
    const [orderBy, setOrderBy] = useState("created_at");
    const [orderDirection, setOrderDirection] = useState("desc");

    // delete
    const [reqId, setReqId] = useState(null);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [delLoading, setDelLoading] = useState(false);

    // popup / form
    const [showPopup, setShowPopup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formMode, setFormMode] = useState("add"); // add | edit
    const [selectedItem, setSelectedItem] = useState(null);

    // form data
    const [formData, setFormData] = useState({
        scope: "global",
        user_id: "",
        group_id: "",
        position_id: "",
        floor_id: "",
        message: "",
    });

    // load select lists
    const loadSelectOptions = async () => {
        try {
            const [uRes, gRes, pRes, fRes] = await Promise.all([
                API.get("/admin/users", { params: { per_page: 1000 } }),
                API.get("/admin/groups", { params: { per_page: 1000 } }),
                API.get("/admin/positions", { params: { per_page: 1000 } }),
                API.get("/admin/floors", { params: { per_page: 1000 } }),
            ]);

            setUsers(uRes?.data?.data?.users || uRes?.data?.data || []);
            setGroups(gRes?.data?.data?.groups || gRes?.data?.data || []);
            setPositions(pRes?.data?.data?.positions || pRes?.data?.data || []);
            setFloors(fRes?.data?.data?.floors || fRes?.data?.data || []);
        } catch (err) {
            console.error("Error loading options:", err);
            setUsers([]); setGroups([]); setPositions([]); setFloors([]);
        }
    };

    // fetch list with filters & sorting
    const getList = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/admin/messages", {
                params: {
                    search: searchTerm || undefined,
                    page,
                    per_page: perPage,
                    user_id: userFilter || undefined,
                    group_id: groupFilter || undefined,
                    position_id: positionFilter || undefined,
                    floor_id: floorFilter || undefined,
                    order_by: orderBy,
                    order_direction: orderDirection,
                },
            });

            const payload = data?.data || {};
            const items = payload.messages || payload || [];

            // normalize relations
            const normalized = items.map((it) => {
                const userObj = it.user && typeof it.user === "object"
                    ? it.user
                    : (it.user_name ? { id: it.user_id ?? null, name: it.user_name, email: it.user_email ?? "" } : it.user || null);

                const groupObj = it.group && typeof it.group === "object"
                    ? it.group
                    : (it.group_name ? { id: it.group_id ?? null, name: it.group_name } : it.group || null);

                const positionObj = it.position && typeof it.position === "object"
                    ? it.position
                    : (it.position_name ? { id: it.position_id ?? null, name: it.position_name } : it.position || null);

                const floorObj = it.floor && typeof it.floor === "object"
                    ? it.floor
                    : (it.floor_name ? { id: it.floor_id ?? null, name: it.floor_name } : it.floor || null);

                return {
                    ...it,
                    user: userObj,
                    group: groupObj,
                    position: positionObj,
                    floor: floorObj,
                };
            });

            setList(normalized);
            setTotalRecords(payload.total || 0);
        } catch (err) {
            console.error("Error fetching messages:", err);
            setList([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSelectOptions();
        getList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // whenever filters / sorting / perPage change reset page to 1 and reload
        setPage(1);
        getList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, perPage, userFilter, groupFilter, positionFilter, floorFilter, orderBy, orderDirection]);

    useEffect(() => {
        // fetch when page changes
        getList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // sorting helper: maps column key to order_by param we send
    const colToOrderKey = {
        date: "created_at",
        message: "message",
        name: "user_name",
        email: "user_email",
        group: "group_name",
        position: "position_name",
        floor: "floor_name",
        id: "id",
    };

    const handleSort = (col) => {
        const key = colToOrderKey[col] || col;
        if (orderBy === key) {
            setOrderDirection((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setOrderBy(key);
            setOrderDirection("asc");
        }
    };

    // two-arrow indicator with active direction highlighted
    const sortIndicator = (col) => {
        const key = colToOrderKey[col] || col;
        if (orderBy !== key) return null;
        return orderDirection === "asc" ? " ↑" : " ↓";
    };

    const openAddPopup = () => {
        setFormMode("add");
        setSelectedItem(null);
        setFormData({
            scope: "global",
            user_id: "",
            group_id: "",
            position_id: "",
            floor_id: "",
            title: "",
            file: null,
        });
        setShowPopup(true);
    };

    const openEditPopup = (item) => {
        setFormMode("edit");
        setSelectedItem(item);
        setFormData({
            scope: item.scope ?? (item.user ? "user" : item.group ? "group" : item.position ? "position" : item.floor ? "floor" : "global"),
            user_id: item.user?.id ?? item.user_id ?? "",
            group_id: item.group?.id ?? item.group_id ?? "",
            position_id: item.position?.id ?? item.position_id ?? "",
            floor_id: item.floor?.id ?? item.floor_id ?? "",
            message: item.message || item.body || "",
        });
        setShowPopup(true);
    };

    const closePopup = () => setShowPopup(false);

    const submitForm = async (e) => {
        e.preventDefault();

        if (!formData.message) {
            toast.error(t("common.validation.required") || "Message is required", { theme: "dark", autoClose: 2000 });
            return;
        }
        if (formData.scope === "user" && !formData.user_id) { toast.error("Please select a user", { theme: "dark", autoClose: 2000 }); return; }
        if (formData.scope === "group" && !formData.group_id) { toast.error("Please select a group", { theme: "dark", autoClose: 2000 }); return; }
        if (formData.scope === "position" && !formData.position_id) { toast.error("Please select a position", { theme: "dark", autoClose: 2000 }); return; }
        if (formData.scope === "floor" && !formData.floor_id) { toast.error("Please select a floor", { theme: "dark", autoClose: 2000 }); return; }

        setIsSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("scope", formData.scope);
            fd.append("message", formData.message || "");
            if (formData.scope === "user" && formData.user_id) {
                fd.append("user_id", formData.user_id);
            } else if (formData.scope === "group" && formData.group_id) {
                fd.append("group_id", formData.group_id);
            } else if (formData.scope === "position" && formData.position_id) {
                fd.append("position_id", formData.position_id);
            } else if (formData.scope === "floor" && formData.floor_id) {
                fd.append("floor_id", formData.floor_id);
            }

            let response;
            if (formMode === "edit" && selectedItem) {
                response = await API.post(`/admin/messages/${selectedItem.id}`, fd, { headers: { "Content-Type": "multipart/form-data", "X-HTTP-Method-Override": "PUT" } });
            } else {
                response = await API.post("/admin/messages", fd, { headers: { "Content-Type": "multipart/form-data" } });
            }

            toast.success(response?.data?.message || t("common.save_success"), { theme: "dark", autoClose: 2000 });
            getList(); closePopup();
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || t("common.save_error"), { theme: "dark", autoClose: 2000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id) => { setReqId(id || null); setOpenDeleteModal(true); };
    const handleConfirmDelete = async () => {
        try {
            setDelLoading(true);
            const resp = await API.delete(`/admin/messages/${reqId}`);
            if (resp?.data?.success) {
                toast.success(resp.data.message || t("common.delete.success"), { theme: "dark", autoClose: 2000 });
                getList(); setReqId(null); setOpenDeleteModal(false);
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

    return (
        <div className="main">
            <Sidebar />
            <Header pageTitle={t("messages.plural") || "Messages"} />
            <div className="container">
                <div className="dashboard-container">
                    <div className="table-container">
                        <div className="table-header">
                            {/* first row: title (left) and add button (right) */}
                            <div className="table-header__top">
                                <div className="table-header__title-wrap">
                                    <h3 className="table-title" style={{ margin: 0 }}>{t("messages.plural") || "Messages"}</h3>
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

                                <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className="select-input">
                                    <option value="">{t("groups.plural") || "Groups"}</option>
                                    {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>

                                <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} className="select-input">
                                    <option value="">{t("positions.plural") || "Positions"}</option>
                                    {positions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>

                                <select value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)} className="select-input">
                                    <option value="">{t("floors.plural") || "Floors"}</option>
                                    {floors.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>

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
                                        <th style={{ cursor: "pointer" }} onClick={() => handleSort("date")}>
                                            {t("common.created_at") || "Date"} {sortIndicator("date")}
                                        </th>
                                        <th>
                                            {t("messages.singular") || "Message"}
                                        </th>
                                        <th style={{ cursor: "pointer" }} onClick={() => handleSort("name")}>
                                            {t("users.name") || "Name"} {sortIndicator("name")}
                                        </th>
                                        <th style={{ cursor: "pointer" }} onClick={() => handleSort("email")}>
                                            {t("users.email") || "Email"} {sortIndicator("email")}
                                        </th>
                                        <th style={{ cursor: "pointer" }} onClick={() => handleSort("group")}>
                                            {t("groups.singular") || "Group"} {sortIndicator("group")}
                                        </th>
                                        <th style={{ cursor: "pointer" }} onClick={() => handleSort("position")}>
                                            {t("positions.singular") || "Position"} {sortIndicator("position")}
                                        </th>
                                        <th style={{ cursor: "pointer" }} onClick={() => handleSort("floor")}>
                                            {t("floors.singular") || "Floor"} {sortIndicator("floor")}
                                        </th>

                                        <th>{t("common.actions") || "Actions"}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={9}>{t("common.loading")}...</td></tr>
                                    ) : list.length ? (
                                        list.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.created_at ?? "-"}</td>

                                                <td style={{ maxWidth: 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    {item.short_message ?? item.message ?? "-"}
                                                </td>

                                                <td>{item.user?.name ?? item.user_name ?? "-"}</td>
                                                <td>{item.user?.email ?? item.user_email ?? "-"}</td>

                                                <td>{item.group?.name ?? item.group_name ?? "-"}</td>
                                                <td>{item.position?.name ?? item.position_name ?? "-"}</td>
                                                <td>{item.floor?.name ?? item.floor_name ?? "-"}</td>

                                                <td>
                                                    {/* <button className="btn-action" onClick={() => openEditPopup(item)}>{t("common.edit")}</button> */}
                                                    <button className="btn-action btn-trash" onClick={() => handleDelete(item.id)}>{t("common.delete")}</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={9} style={{ textAlign: "center" }}>{t("common.result.no_record")}</td></tr>
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
                                    <h2>{formMode === "edit" ? `${t("common.edit")} ${t("messages.singular") || "Message"}` : `${t("common.add")} ${t("messages.singular") || "Message"}`}</h2>
                                    <img src={CrossIcon} alt="" className="popup-close" onClick={closePopup} />
                                </div>

                                <form onSubmit={submitForm}>
                                    <div className="popup-body">
                                        <div className="form-container">
                                            <ul className="form-row">
                                                <li>
                                                    <label>Scope</label>
                                                    <select
                                                        name="scope"
                                                        className="form-control"
                                                        value={formData.scope}
                                                        onChange={(e) => {
                                                            const s = e.target.value;
                                                            setFormData(p => ({
                                                                ...p,
                                                                scope: s,
                                                                user_id: s === "user" ? p.user_id : "",
                                                                group_id: s === "group" ? p.group_id : "",
                                                                position_id: s === "position" ? p.position_id : "",
                                                                floor_id: s === "floor" ? p.floor_id : "",
                                                            }));
                                                        }}
                                                    >
                                                        <option value="global">Global</option>
                                                        <option value="user">User</option>
                                                        <option value="group">Group</option>
                                                        <option value="position">Position</option>
                                                        <option value="floor">Floor</option>
                                                    </select>
                                                </li>

                                                {formData.scope === "user" && (
                                                    <li>
                                                        <label>{t("users.name")}</label>
                                                        <select name="user_id" className="form-control" value={formData.user_id} onChange={(e) => setFormData(p => ({ ...p, user_id: e.target.value }))}>
                                                            <option value="">{t("common.select")}</option>
                                                            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                                                        </select>
                                                    </li>
                                                )}

                                                {formData.scope === "group" && (
                                                    <li>
                                                        <label>Group</label>
                                                        <select name="group_id" className="form-control" value={formData.group_id} onChange={(e) => setFormData(p => ({ ...p, group_id: e.target.value }))}>
                                                            <option value="">{t("common.select")}</option>
                                                            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                                        </select>
                                                    </li>
                                                )}

                                                {formData.scope === "position" && (
                                                    <li>
                                                        <label>Position</label>
                                                        <select name="position_id" className="form-control" value={formData.position_id} onChange={(e) => setFormData(p => ({ ...p, position_id: e.target.value }))}>
                                                            <option value="">{t("common.select")}</option>
                                                            {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                        </select>
                                                    </li>
                                                )}

                                                {formData.scope === "floor" && (
                                                    <li>
                                                        <label>Floor</label>
                                                        <select name="floor_id" className="form-control" value={formData.floor_id} onChange={(e) => setFormData(p => ({ ...p, floor_id: e.target.value }))}>
                                                            <option value="">{t("common.select")}</option>
                                                            {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                                        </select>
                                                    </li>
                                                )}

                                                <li>
                                                    <label>{t("messages.singular") || "Message"}</label>
                                                    <textarea name="message" rows={6} className="form-control" placeholder={t("common.enter_placeholder")} value={formData.message} onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}></textarea>
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
                        <div className="popup-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-title">
                            <div className="popup-container modal-sm warning-modal-box">
                                <div className="popup-header">
                                    <h2 id="delete-title">{t("common.delete")}!</h2>
                                    <img src={CrossIcon} alt="close" className="popup-close" onClick={() => setOpenDeleteModal(false)} />
                                </div>

                                <div className="popup-body">
                                    <div className="form-container" style={{ textAlign: "center" }}>
                                        <img src={warningImg} alt="Warning" style={{ width: 64, marginBottom: 15 }} />
                                        <p>{t("messages.delete_confirm") || t("common.delete_confirm")}</p>
                                    </div>
                                </div>

                                <div className="popup-footer">
                                    <button type="button" className="btn btn-danger" disabled={delLoading} onClick={handleConfirmDelete}>
                                        {delLoading ? <CircularProgress size={20} /> : t("common.delete")}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setOpenDeleteModal(false)} style={{ marginLeft: 8 }}>
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

export default Messages;
