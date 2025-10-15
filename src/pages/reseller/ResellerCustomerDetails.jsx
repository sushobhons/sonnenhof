import { useState } from "react";
import { Link } from "react-router-dom";
import ResellerSidebar from "../../layouts/ResellerSidebar";
import ResellerHeader from "../../layouts/ResellerHeader";

// import images
import PdfIcon from "../../assets/images/pdf-icon.svg";
import FileIcon from "../../assets/images/file-icon.svg";
import AvatarIcon from "../../assets/images/avatar-icon.svg";
import DropIcon from "../../assets/images/drop-icon.svg";
import BackIcon from "../../assets/images/back-btn.svg";

const ResellerCustomerDetails = () => {
  const [activeTab, setActiveTab] = useState("order"); // default tab

  return (
    <div className="fullWidth">
      <div className="main">
        <ResellerSidebar />
        <div className="container">
          <ResellerHeader pageTitle="Customers" />
          <div className="mainInnerDiv">
            <div className="resellerInner">
              <div className="dashTop">
                <h2 className="resellerHdn">
                  <a>
                    <img src={BackIcon} alt="" />
                  </a>
                  <img src={AvatarIcon} alt="" />
                  jean luc
                </h2>
                <div className="resellerBtns">
                  <button className="saveBtn">Save</button>
                  <button className="trashBtn">Delete</button>
                </div>
              </div>
              <div className="resellerForm resellerOrderForm">
                <ul>
                  <li>
                    <label>Reseller</label>
                    <select disabled>
                      <option>Chiptuning FS</option>
                    </select>
                  </li>
                  <li>
                    <label>Services</label>
                    <select disabled>
                      <option>Select here</option>
                    </select>
                  </li>
                  <li>
                    <label>Customer Email</label>
                    <input type="text" value="bambap28@yahoo.com" disabled />
                  </li>
                  <li>
                    <label>Number of tokens</label>
                    <select disabled>
                      <option>0</option>
                    </select>
                  </li>
                  <li>
                    <label>Company</label>
                    <input type="text" value="DBperformance" disabled />
                  </li>
                  <li>
                    <label>Phone no*</label>
                    <input type="text" value="9862989696" disabled />
                  </li>
                  <li>
                    <label>VAT number*</label>
                    <input type="text" value="FR18903873453" disabled />
                  </li>
                  <li>
                    <label>Billing Information</label>
                    <input type="text" value="" disabled />
                  </li>
                  <li>
                    <div className="checkForm">
                      <span>Deactivate PayPal</span>
                      <input type="checkbox" disabled />
                    </div>
                  </li>
                  <li>
                    <div className="checkForm">
                      <span>Forcing VAT</span>
                      <input type="checkbox" disabled />
                    </div>
                  </li>
                </ul>
              </div>
              <div className="resellerNav">
                <ul>
                  <li>
                    <Link
                      className={activeTab === "order" ? "active" : ""}
                      onClick={() => setActiveTab("order")}
                    >
                      Order Listings
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={activeTab === "points" ? "active" : ""}
                      onClick={() => setActiveTab("points")}
                    >
                      Point Purchase
                    </Link>
                  </li>
                </ul>
              </div>
              {activeTab === "order" && (
                <div className="resellerTab orderTab">
                  <div className="resellerFilter">
                    <div className="searchFilter">
                      <input type="text" placeholder="Search here" />
                      <select className="orderInput">
                        <option>Order Status</option>
                      </select>
                      <div className="dateFilter">
                        <span>
                          From <input type="date" />
                        </span>
                        <span>
                          To <input type="date" className="date2" />
                        </span>
                      </div>
                    </div>
                    <div className="sortFilter">
                      <button className="deleteBtn deactivateBtn">
                        Delete
                      </button>
                      <button className="pdfBtn">
                        <img src={PdfIcon} alt="" />
                      </button>
                      <button className="fileBtn">
                        <img src={FileIcon} alt="" />
                      </button>
                    </div>
                  </div>
                  <div className="resellerTable">
                    <table>
                      <thead>
                        <tr>
                          <th>
                            <input type="checkbox" />
                          </th>
                          <th>
                            ID <img src={DropIcon} alt="" className="dropBtn" />
                          </th>
                          <th>
                            Date & Time
                            <img src={DropIcon} alt="" className="dropBtn" />
                          </th>
                          <th>
                            Status
                            <img src={DropIcon} alt="" className="dropBtn" />
                          </th>
                          <th>
                            Total (Excl. Tax)
                            <img src={DropIcon} alt="" className="dropBtn" />
                          </th>
                          <th>
                            Total (Incl. Tax)
                            <img src={DropIcon} alt="" className="dropBtn" />
                          </th>
                          <th>
                            Order Paid
                            <img src={DropIcon} alt="" className="dropBtn" />
                          </th>
                          <th>
                            Actions
                            <img src={DropIcon} alt="" className="dropBtn" />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>CC24005280</td>
                          <td>25 mar, 2025 | 09:10</td>
                          <td>
                            <button className="waiting">Waiting</button>
                          </td>
                          <td>110€</td>
                          <td>110€</td>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>
                            <Link
                              to="/admin/customer-order-details"
                              className="viewBtn"
                            >
                              View
                            </Link>
                            <button className="trashBtn">Delete</button>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>CC24005280</td>
                          <td>25 mar, 2025 | 09:10</td>
                          <td>
                            <button className="completed">Completed</button>
                          </td>
                          <td>110€</td>
                          <td>110€</td>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>
                            <Link
                              to="/admin/customer-order-details-completed"
                              className="viewBtn"
                            >
                              View
                            </Link>
                            <button className="trashBtn">Delete</button>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>CC24005280</td>
                          <td>25 mar, 2025 | 09:10</td>
                          <td>
                            <button className="waiting">Waiting</button>
                          </td>
                          <td>110€</td>
                          <td>110€</td>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>
                            <Link
                              to="/admin/customer-order-details"
                              className="viewBtn"
                            >
                              View
                            </Link>
                            <button className="trashBtn">Delete</button>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>CC24005280</td>
                          <td>25 mar, 2025 | 09:10</td>
                          <td>
                            <button className="waiting">Waiting</button>
                          </td>
                          <td>110€</td>
                          <td>110€</td>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>
                            <Link
                              to="/admin/customer-order-details"
                              className="viewBtn"
                            >
                              View
                            </Link>
                            <button className="trashBtn">Delete</button>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>CC24005280</td>
                          <td>25 mar, 2025 | 09:10</td>
                          <td>
                            <button className="waiting">Waiting</button>
                          </td>
                          <td>110€</td>
                          <td>110€</td>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>
                            <Link
                              to="/admin/customer-order-details"
                              className="viewBtn"
                            >
                              View
                            </Link>
                            <button className="trashBtn">Delete</button>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>CC24005280</td>
                          <td>25 mar, 2025 | 09:10</td>
                          <td>
                            <button className="waiting">Waiting</button>
                          </td>
                          <td>110€</td>
                          <td>110€</td>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>
                            <Link
                              to="/admin/customer-order-details"
                              className="viewBtn"
                            >
                              View
                            </Link>
                            <button className="trashBtn">Delete</button>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>CC24005280</td>
                          <td>25 mar, 2025 | 09:10</td>
                          <td>
                            <button className="waiting">Waiting</button>
                          </td>
                          <td>110€</td>
                          <td>110€</td>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>
                            <Link
                              to="/admin/customer-order-details"
                              className="viewBtn"
                            >
                              View
                            </Link>
                            <button className="trashBtn">Delete</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {activeTab === "points" && (
                <div className="resellerTab pointTab">
                  <div className="resellerTable">
                    <table>
                      <thead>
                        <tr>
                          <th>
                            <input type="checkbox" />
                          </th>
                          <th>
                            ID <img src={DropIcon} alt="" className="dropBtn" />
                          </th>
                          <th>
                            Date & Time{" "}
                            <img src={DropIcon} alt="" className="dropBtn" />
                          </th>
                          <th>
                            No. points{" "}
                            <img src={DropIcon} alt="" className="dropBtn" />
                          </th>
                          <th>
                            Total (Excl. Tax){" "}
                            <img src={DropIcon} alt="" className="dropBtn" />
                          </th>
                          <th>
                            Total (VAT){" "}
                            <img src={DropIcon} alt="" className="dropBtn" />
                          </th>
                          <th>
                            Total (Incl. Tax){" "}
                            <img src={DropIcon} alt="" className="dropBtn" />
                          </th>
                          <th>
                            Order Paid{" "}
                            <img src={DropIcon} alt="" className="dropBtn" />
                          </th>
                          <th>
                            Actions{" "}
                            <img src={DropIcon} alt="" className="dropBtn" />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>CC24005280</td>
                          <td>25 mar, 2025 | 09:10</td>
                          <td>880</td>
                          <td>800.00€</td>
                          <td>80.00€</td>
                          <td>800.00€</td>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>
                            <button className="trashBtn">Delete</button>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>CC24005280</td>
                          <td>25 mar, 2025 | 09:10</td>
                          <td>880</td>
                          <td>800.00€</td>
                          <td>80.00€</td>
                          <td>800.00€</td>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>
                            <button className="trashBtn">Delete</button>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>CC24005280</td>
                          <td>25 mar, 2025 | 09:10</td>
                          <td>880</td>
                          <td>800.00€</td>
                          <td>80.00€</td>
                          <td>800.00€</td>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>
                            <button className="trashBtn">Delete</button>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>CC24005280</td>
                          <td>25 mar, 2025 | 09:10</td>
                          <td>880</td>
                          <td>800.00€</td>
                          <td>80.00€</td>
                          <td>800.00€</td>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>
                            <button className="trashBtn">Delete</button>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>CC24005280</td>
                          <td>25 mar, 2025 | 09:10</td>
                          <td>880</td>
                          <td>800.00€</td>
                          <td>80.00€</td>
                          <td>800.00€</td>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>
                            <button className="trashBtn">Delete</button>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>CC24005280</td>
                          <td>25 mar, 2025 | 09:10</td>
                          <td>880</td>
                          <td>800.00€</td>
                          <td>80.00€</td>
                          <td>800.00€</td>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>
                            <button className="trashBtn">Delete</button>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>CC24005280</td>
                          <td>25 mar, 2025 | 09:10</td>
                          <td>880</td>
                          <td>800.00€</td>
                          <td>80.00€</td>
                          <td>800.00€</td>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>
                            <button className="trashBtn">Delete</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResellerCustomerDetails;
