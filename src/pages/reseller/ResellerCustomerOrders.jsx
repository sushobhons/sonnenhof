import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ResellerSidebar from "../../layouts/ResellerSidebar";
import ResellerHeader from "../../layouts/ResellerHeader";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";

// import images
import inProgressIcon from "../../assets/images/in-progress-icon.png";
import searchicon from "../../assets/images/search-icon.png";
import printIcon from "../../assets/images/print-icon.png";
import downloadImg from "../../assets/images/download-img.png";
import dropdownIcon from "../../assets/images/dropdown-black-icon.png";
import inCompleteIcon from "../../assets/images/in-complete-icon.png";
import viewIcon from "../../assets/images/view-icon.png";
import trashIcon from "../../assets/images/trash-icon.png";
import { IMAGE_URL } from "../../utils/apiUrl";
import BackDrop from "../skeleton/BackDrop";
import API from "../../api/axios";
import { toast } from "react-toastify";

// Sample data
const initialOrders = [
  {
    id: "CC24005280",
    date: "25 mar, 2025",
    time: "09:10",
    company: "jean luc",
    customerEmail: "narbonne.as@gmail.com",
    total: 90.0,
    totalIncl: 90.0,
    status: "Waiting",
    link: "/reseller/reseller-order-infromation-waiting-processed",
  },
  {
    id: "CC24005281",
    date: "25 mar, 2025",
    time: "08:58",
    company: "jean luc",
    customerEmail: "narbonne.as@gmail.com",
    total: 144.0,
    totalIncl: 144.0,
    status: "Waiting",
    link: "/reseller/reseller-order-infromation-waiting-processed",
  },
  {
    id: "CC24005282",
    date: "24 mar, 2025",
    time: "10:14",
    company: "GMA GELFI MECA AUTO",
    customerEmail: "teddy.karoum@gmail.com",
    total: 204.0,
    totalIncl: 204.0,
    status: "Waiting",
    link: "/reseller/reseller-order-infromation-waiting-processed",
  },
  {
    id: "CC24005283",
    date: "24 mar, 2025",
    time: "10:37",
    company: "Cameron Williamson",
    customerEmail: "samsduclams@hotmail.fr",
    total: 144.0,
    totalIncl: 144.0,
    status: "Waiting",
    link: "/reseller/reseller-order-infromation-waiting-processed",
  },
  {
    id: "CC24005284",
    date: "22 mar, 2025",
    time: "08:35",
    company: "A.L PERFORMANCE",
    customerEmail: "alanaln54000@gmail.com",
    total: 90.0,
    totalIncl: 90.0,
    status: "Completed",
    link: "/reseller/reseller-order-infromation",
  },
  {
    id: "CC24005285",
    date: "22 mar, 2025",
    time: "09:48",
    company: "Sat13",
    customerEmail: "samsduclams@hotmail.fr",
    total: 144.0,
    totalIncl: 144.0,
    status: "Completed",
    link: "/reseller/reseller-order-infromation",
  },
  {
    id: "CC24005280",
    date: "25 mar, 2025",
    time: "09:10",
    company: "jean luc",
    customerEmail: "narbonne.as@gmail.com",
    total: 90.0,
    totalIncl: 90.0,
    status: "Waiting",
    link: "/reseller/reseller-order-infromation-waiting-processed",
  },
  {
    id: "CC24005281",
    date: "25 mar, 2025",
    time: "08:58",
    company: "jean luc",
    customerEmail: "narbonne.as@gmail.com",
    total: 144.0,
    totalIncl: 144.0,
    status: "Waiting",
    link: "/reseller/reseller-order-infromation-waiting-processed",
  },
  {
    id: "CC24005282",
    date: "24 mar, 2025",
    time: "10:14",
    company: "GMA GELFI MECA AUTO",
    customerEmail: "teddy.karoum@gmail.com",
    total: 204.0,
    totalIncl: 204.0,
    status: "Waiting",
    link: "/reseller/reseller-order-infromation-waiting-processed",
  },
  {
    id: "CC24005283",
    date: "24 mar, 2025",
    time: "10:37",
    company: "Cameron Williamson",
    customerEmail: "samsduclams@hotmail.fr",
    total: 144.0,
    totalIncl: 144.0,
    status: "Waiting",
    link: "/reseller/reseller-order-infromation-waiting-processed",
  },
  {
    id: "CC24005284",
    date: "22 mar, 2025",
    time: "08:35",
    company: "A.L PERFORMANCE",
    customerEmail: "alanaln54000@gmail.com",
    total: 90.0,
    totalIncl: 90.0,
    status: "Completed",
    link: "/reseller/reseller-order-infromation",
  },
  {
    id: "CC24005285",
    date: "22 mar, 2025",
    time: "09:48",
    company: "Sat13",
    customerEmail: "samsduclams@hotmail.fr",
    total: 144.0,
    totalIncl: 144.0,
    status: "Completed",
    link: "/reseller/reseller-order-infromation",
  },
  {
    id: "CC24005283",
    date: "24 mar, 2025",
    time: "10:37",
    company: "Cameron Williamson",
    customerEmail: "samsduclams@hotmail.fr",
    total: 144.0,
    totalIncl: 144.0,
    status: "Waiting",
    link: "/reseller/reseller-order-infromation-waiting-processed",
  },
  {
    id: "CC24005284",
    date: "22 mar, 2025",
    time: "08:35",
    company: "A.L PERFORMANCE",
    customerEmail: "alanaln54000@gmail.com",
    total: 90.0,
    totalIncl: 90.0,
    status: "Completed",
    link: "/reseller/reseller-order-infromation",
  },
  {
    id: "CC24005285",
    date: "22 mar, 2025",
    time: "09:48",
    company: "Sat13",
    customerEmail: "samsduclams@hotmail.fr",
    total: 144.0,
    totalIncl: 144.0,
    status: "Completed",
    link: "/reseller/reseller-order-infromation",
  },
];

const parseDate = (str) => {
  const [day, monStr, year] = str.split(" ");
  const month = new Date(`${monStr} 1, 2000`).getMonth();
  return new Date(year, month, parseInt(day), 0, 0, 0);
};

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const ResellerCustomerOrders = () => {
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [age, setAge] = useState("");
  const navigate = useNavigate();
  const [personalizeData, setPersonalizeData] = useState({
    logo: "",
    logoName: "",
    bgColor: "#0F0F0F",
    profileImage: "",
  });
  const [pageLoader, setPageLoader] = useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Data Table
  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const sortedOrders = [...initialOrders].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];

    switch (sortConfig.key) {
      case "date":
        aVal = parseDate(a.date);
        bVal = parseDate(b.date);
        break;
      case "total":
        aVal = a.total;
        bVal = b.total;
        break;
      case "totalIncl":
        aVal = a.total;
        bVal = b.total;
        break;
      case "status":
      case "company":
      case "customerEmail":
      case "id":
        aVal = a[sortConfig.key].toLowerCase();
        bVal = b[sortConfig.key].toLowerCase();
        break;
      case "action":
        aVal = a.status === "Completed" ? 2 : 1; // higher value = more actions
        bVal = b.status === "Completed" ? 2 : 1;
        break;
      default:
        break;
    }

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const filteredOrders = sortedOrders.filter((order) => {
    const matchText = (order.id + order.vehicle + order.vehicleType)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const orderDate = parseDate(order.date);
    const matchFrom =
      !fromDate || orderDate >= new Date(fromDate + "T00:00:00");
    const matchTo = !toDate || orderDate <= new Date(toDate + "T23:59:59");

    return matchText && matchFrom && matchTo;
  });

  const totalEntries = filteredOrders.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  const toggleCheckbox = (index) => {
    setSelectedOrders((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const isAllSelected = currentOrders.every((_, i) =>
    selectedOrders.includes(startIndex + i)
  );

  const toggleAllCheckboxes = () => {
    const allIndexes = currentOrders.map((_, i) => startIndex + i);
    if (isAllSelected) {
      setSelectedOrders((prev) => prev.filter((i) => !allIndexes.includes(i)));
    } else {
      setSelectedOrders((prev) => [...new Set([...prev, ...allIndexes])]);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const pageLimit = 5;
    if (totalPages > pageLimit) {
      if (currentPage <= 3) {
        for (let i = 1; i <= pageLimit; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage > totalPages - 3) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - pageLimit + 1; i <= totalPages; i++)
          pages.push(i);
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    } else {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    }
    return pages;
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const changeEntriesPerPage = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  // Data Table
  const fetchAccountDetails = async () => {
    try {
      setPageLoader(true);
      const apiRes = await API.get(`/reseller/profile`);
      setPersonalizeData({
        logo: IMAGE_URL + apiRes.data.data.logo,
        logoName: fileName(IMAGE_URL + apiRes.data.data.logo),
        bgColor: apiRes.data.data.admin_panel_color,
        profileImage: apiRes.data.data.profile_pic,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setPageLoader(false);
    }
  };

  const onProfileImgUpdate = (val) => {
    if (val) {
      fetchAccountDetails();
    }
  };

  useEffect(() => {
    fetchAccountDetails();
  }, []);

  return (
    <div className="fullWidth">
      {pageLoader ? (
        <BackDrop />
      ) : (
        <div className="main">
          <ResellerSidebar color={personalizeData?.bgColor} />
          <div className="container">
            <ResellerHeader
              pageTitle="Orders"
              color={personalizeData?.bgColor}
              onProfileImgUpdate={onProfileImgUpdate}
              profileImg={
                personalizeData?.profileImage && personalizeData?.profileImage
              }
            />
            <div className="mainInnerDiv">
              {/* Data Table Start */}
              <div className="dashboard-datatable">
                <div className="datatable-header-group">
                  <h3>Customer Orders</h3>
                  <div className="search-group">
                    <img src={searchicon} alt="" />
                    <input
                      type="text"
                      placeholder="Search here"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="top-controls">
                  <div className="top-left-controls">
                    <div className="order-filter">
                      <FormControl sx={{ m: 0, minWidth: "100%" }}>
                        <Select
                          value={age}
                          onChange={handleChange}
                          displayEmpty
                          inputProps={{ "aria-label": "Without label" }}
                          sx={{
                            height: 36,
                            minHeight: 36,
                            width: "100%",
                            color: "#525252",
                            fontSize: "14px",
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 500,
                            padding: "0 12px 0 8px",
                            border: "1px solid #E3E3E3",
                            borderRadius: "8px",
                            backgroundColor: "#fff", // your preferred background
                            backgroundImage: `url(${dropdownIcon})`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 12px center",
                            backgroundSize: "20px auto",
                            "& .MuiSelect-select": {
                              padding: "0 12px",
                              display: "flex",
                              alignItems: "center",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              border: "none",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              /*border: "1px solid #E3E3E3",*/
                            },
                            "& .MuiSelect-icon": {
                              fontSize: "18px",
                              display: "none",
                            },
                          }}
                        >
                          <MenuItem value="">Order status</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                    <div className="date-range">
                      <div className="custom-date-wrapper">
                        <label>From</label>
                        <input
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="from-date"
                        />
                      </div>
                      <div className="custom-date-wrapper">
                        <label>To</label>
                        <input
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className="to-date"
                        />
                      </div>
                    </div>
                    <div className="unpaid-orders-section">
                      <span className="text-box">
                        Unnically display unpaid orders
                      </span>
                      <Checkbox {...label} className="custom-checkbox2" />
                    </div>
                  </div>
                  <div className="top-right-controls">
                    <button className="delete-btn disabled-delete-btn">
                      Delete
                    </button>
                    <button className="print-btn">
                      <img src={printIcon} alt="" />
                    </button>
                    <button className="download-btn">
                      <img src={downloadImg} alt="" />
                    </button>
                  </div>
                </div>
                <div className="table-container">
                  <table className="custom-data-table">
                    <thead>
                      <tr>
                        <th>
                          {/* <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={toggleAllCheckboxes}
                          /> */}
                          <Checkbox
                            className="custom-checkbox2"
                            checked={isAllSelected}
                            onChange={toggleAllCheckboxes}
                          />
                        </th>
                        <th
                          onClick={() => handleSort("id")}
                          className={`sortable ${
                            sortConfig.key === "id" ? sortConfig.direction : ""
                          }`}
                        >
                          ID
                        </th>
                        <th
                          onClick={() => handleSort("date")}
                          className={`sortable ${
                            sortConfig.key === "date" ? sortConfig.direction : ""
                          }`}
                        >
                          Date & Time
                        </th>
                        <th
                          onClick={() => handleSort("status")}
                          className={`sortable ${
                            sortConfig.key === "status"
                              ? sortConfig.direction
                              : ""
                          }`}
                        >
                          Status
                        </th>
                        <th
                          onClick={() => handleSort("company")}
                          className={`sortable ${
                            sortConfig.key === "company"
                              ? sortConfig.direction
                              : ""
                          }`}
                        >
                          Company
                        </th>
                        <th
                          onClick={() => handleSort("customerEmail")}
                          className={`sortable ${
                            sortConfig.key === "customerEmail"
                              ? sortConfig.direction
                              : ""
                          }`}
                        >
                          Customer Email
                        </th>
                        <th
                          onClick={() => handleSort("total")}
                          className={`sortable ${
                            sortConfig.key === "total" ? sortConfig.direction : ""
                          }`}
                        >
                          Total (Excl. Tax)
                        </th>
                        <th
                          onClick={() => handleSort("totalIncl")}
                          className={`sortable ${
                            sortConfig.key === "totalIncl"
                              ? sortConfig.direction
                              : ""
                          }`}
                        >
                          Total (Incl. Tax)
                        </th>
                        <th>Order Paid</th>
                        <th>Deactivate PayPal</th>
                        <th
                          onClick={() => handleSort("action")}
                          className={`sortable ${
                            sortConfig.key === "action"
                              ? sortConfig.direction
                              : ""
                          }`}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOrders.map((order, index) => (
                        <tr key={index}>
                          <td>
                            {/* <input
                              type="checkbox"
                              checked={selectedOrders.includes(
                                startIndex + index
                              )}
                              onChange={() => toggleCheckbox(startIndex + index)}
                            /> */}
                            <Checkbox
                              className="custom-checkbox2"
                              checked={selectedOrders.includes(
                                startIndex + index
                              )}
                              onChange={() => toggleCheckbox(startIndex + index)}
                            />
                          </td>
                          <td>{order.id}</td>
                          <td>
                            {order.date} | {order.time}
                          </td>
                          <td>
                            <span
                              className={`status ${order.status.toLowerCase()}`}
                            >
                              <img
                                src={
                                  order.status === "Waiting"
                                    ? inProgressIcon
                                    : inCompleteIcon
                                }
                                alt=""
                              />
                              {order.status}
                            </span>
                          </td>
                          <td>{order.company}</td>
                          <td>{order.customerEmail}</td>
                          <td>{order.total.toFixed(2)}€</td>
                          <td>{order.totalIncl.toFixed(2)}€</td>
                          <td>
                            <Checkbox className="custom-checkbox2" />
                          </td>
                          <td>
                            <Checkbox className="custom-checkbox2" />
                          </td>
                          <td>
                            <button
                              className="view"
                              onClick={() => navigate(order.link)}
                            >
                              <img src={viewIcon} alt="" /> View
                            </button>
                            {/* {order.status === "Completed" && ( */}
                            <button className="delete">
                              <img src={trashIcon} alt="" /> Delete
                            </button>
                            {/* )} */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bottom-controls">
                  <div className="entries-filter">
                    <label>Show</label>
                    <select
                      value={entriesPerPage}
                      onChange={changeEntriesPerPage}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                    </select>
                    <label>
                      <span>entries</span>
                    </label>
                  </div>
                  <div className="pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="prev-btn"
                    >
                      Previous
                    </button>
                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === "number" && paginate(page)}
                        className={
                          typeof page === "number" && currentPage === page
                            ? "active"
                            : ""
                        }
                        disabled={page === "..."}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="next-btn"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
              {/* Data Table Start */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResellerCustomerOrders;
