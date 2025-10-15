import { useState } from "react";
import { Link } from "react-router-dom";
import ResellerSidebar from "../../layouts/ResellerSidebar";
import ResellerHeader from "../../layouts/ResellerHeader";

// import images
import PdfIcon from "../../assets/images/pdf-icon.svg";
import FileIcon from "../../assets/images/file-icon.svg";
import DropIcon from "../../assets/images/drop-icon.svg";
import BackIcon from "../../assets/images/back-btn.svg";
import UploadImg from "../../assets/images/upload-img.svg";

const ResellerOrderInfromation = () => {
  const [activeTab, setActiveTab] = useState("orders"); // default tab

  return (
    <div className="fullWidth">
      <div className="main">
        <ResellerSidebar />
        <div className="container">
          <ResellerHeader pageTitle="Orders" />
          <div className="mainInnerDiv">
            <div className="resellerInner">
              <div className="dashTop">
                <h2 className="resellerHdn">
                  <Link to="">
                    <img src={BackIcon} alt="" />
                  </Link>
                  Order ID: CC24005120
                </h2>
                <div className="resellerBtns">
                  <button className="invoiceBtn">View Invoice</button>
                  <button className="downloadBtn">Download .ini file</button>
                  <button className="modifiedBtn">Modified ECU File</button>
                  <button className="trashBtn">Delete</button>
                </div>
              </div>
              <div className="resellerForm resellerOrderForm">
                <ul>
                  <li>
                    <label>Order Status</label>
                    <select>
                      <option>Pending settlement</option>
                      <option>Waiting to be processed</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                  </li>
                  <li>
                    <label>Customer Email</label>
                    <input type="text" value="b-dupuis@outlook.fr" disabled />
                  </li>
                  <li>
                    <label>Phone no*</label>
                    <input type="text" value="9862989696" disabled />
                  </li>
                  <li>
                    <label>Company</label>
                    <input type="text" value="DBperformance" disabled />
                  </li>
                  <li>
                    <label>VAT number*</label>
                    <input type="text" value="FR18903873453" disabled />
                  </li>
                  <li>
                    <label>Total excl. VAT after</label>
                    <input type="text" value="75" disabled />
                  </li>
                  <li>
                    <label>Total VAT</label>
                    <input type="text" value="12.00" disabled />
                  </li>
                  <li>
                    <label>Total incl. VAT</label>
                    <input type="text" value="87.00" disabled />
                  </li>
                  <li>
                    <label>Tokens used</label>
                    <input type="text" value="0.00" disabled />
                  </li>
                  <li>
                    <label>Amount to be donated</label>
                    <input type="text" value="0.00" disabled />
                  </li>
                  <li>
                    <div className="checkForm">
                      <span>Paid order</span>
                      <input type="checkbox" checked disabled />
                    </div>
                  </li>
                  <li>
                    <div className="checkForm">
                      <span>Deactivate PayPal</span>
                      <input type="checkbox" disabled />
                    </div>
                  </li>
                </ul>
              </div>
              <div className="resellerNav">
                <ul>
                  <li>
                    <Link
                      className={activeTab === "orders" ? "active" : ""}
                      onClick={() => setActiveTab("orders")}
                    >
                      Orders Information
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={activeTab === "paypal" ? "active" : ""}
                      onClick={() => setActiveTab("paypal")}
                    >
                      PayPal Information
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={activeTab === "request" ? "active" : ""}
                      onClick={() => setActiveTab("request")}
                    >
                      After Sale Service Request
                    </Link>
                  </li>
                </ul>
              </div>
              {activeTab === "orders" && (
                <>
                  <div className="orderStatus">
                    <ul>
                      <li>
                        <h2>
                          Order Status :{" "}
                          <button className="completed">Completed</button>
                        </h2>
                      </li>
                      <li>
                        <h2>Order Date : 28 feb, 2025 | 09:03</h2>
                      </li>
                      <li>
                        <h2>Total Price/Tokens : 75 tokens</h2>
                      </li>
                    </ul>
                  </div>
                  <div className="orderInfo">
                    <div className="vehicleInfo">
                      <ul>
                        <li className="infoHdn">
                          <h3>Vehicle</h3>
                        </li>
                        <li className="infoHdn">
                          <h3></h3>
                        </li>
                        <li>
                          <h4>Vehicle type</h4>
                          <span>PKD</span>
                        </li>
                        <li>
                          <h4>Model</h4>
                          <span>30d</span>
                        </li>
                        <li>
                          <h4>Vehicle manufacturer</h4>
                          <span>PKD</span>
                        </li>
                        <li>
                          <h4>Model year</h4>
                          <span>2008</span>
                        </li>
                        <li>
                          <h4>Series</h4>
                          <span>5er</span>
                        </li>
                        <li>
                          <h4>Mileage</h4>
                          <span>220000</span>
                        </li>
                        <li>
                          <h4>Version</h4>
                          <span>E60/E61</span>
                        </li>
                      </ul>
                      <ul>
                        <li className="infoHdn">
                          <h3>Engine</h3>
                        </li>
                        <li className="infoHdn">
                          <h3>ECU</h3>
                        </li>
                        <li>
                          <h4>Engine type</h4>
                          <span>Turbo Diesel</span>
                        </li>
                        <li>
                          <h4>ECU manufacturer</h4>
                          <span>Bosch</span>
                        </li>
                        <li>
                          <h4>Cylinder</h4>
                          <span>6</span>
                        </li>
                        <li>
                          <h4>Build</h4>
                          <span>EDC16CP34</span>
                        </li>
                        <li>
                          <h4>Puissance</h4>
                          <span>173</span>
                        </li>
                        <li>
                          <h4>Headwear</h4>
                          <span>--</span>
                        </li>
                        <li>
                          <h4>Transmission</h4>
                          <span>Automatic</span>
                        </li>
                        <li>
                          <h4>Software</h4>
                          <span>--</span>
                        </li>
                      </ul>
                    </div>
                    <div className="vehicleInfo otherInfo">
                      <ul>
                        <li className="infoHdn">
                          <h3>Other</h3>
                        </li>
                        <li>
                          <h4>Red Headwear</h4>
                          <span>GENIUS</span>
                        </li>
                        <li>
                          <h4>Build</h4>
                          <span>
                            GQ511DS<br></br>
                            530xd<br></br>
                            stage 2 down pipe<br></br>
                            43e2 dde actuateur de papillon.activation<br></br>
                            4cf3 dde capteur de contrepression d echappement .
                            signal
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="vehicleInfo orderService">
                      <ul>
                        <li className="infoHdn">
                          <h3>Orders</h3>
                        </li>
                        <li className="infoHdn">
                          <h3></h3>
                        </li>
                        <li>
                          <h4>Stage</h4>
                          <span>Stage 1 - 100€</span>
                        </li>
                        <li>
                          <h4>Other service</h4>
                          <span>Cks1 - 50€</span>
                        </li>
                      </ul>
                    </div>
                    <div className="vehicleInfo uploadInfo">
                      <ul>
                        <li className="infoHdn">
                          <h3>Uploaded file</h3>
                        </li>
                        <li>
                          <input
                            type="text"
                            value="ECU_Original_CC25000843_05-03-2025 17:39:45.FPF"
                          />
                          <button>Download File</button>
                        </li>
                      </ul>
                    </div>
                    <div className="vehicleInfo uploadInfo">
                      <ul>
                        <li className="infoHdn">
                          <h3>Modified file</h3>
                        </li>
                        <li>
                          <input
                            type="text"
                            value="ECU_MODIF_CC25001818_03-05-2025 09:53:30"
                          />
                          <button>Download File</button>
                        </li>
                      </ul>
                    </div>
                    <div className="vehicleInfo uploadInfo">
                      <ul>
                        <li className="infoHdn">
                          <h3>Modified file</h3>
                        </li>
                        <li>
                          <input type="file" />
                          <div className="uploadImg">
                            <img src={UploadImg} alt="" />
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </>
              )}
              {activeTab === "paypal" && (
                <div className="resellerTab pointTab">
                  <div className="resellerForm">
                    <ul>
                      <li>
                        <label>PayPal payment id</label>
                        <input
                          type="text"
                          value="PAYID-NAH6QXI0GF737701Y874960U"
                        />
                      </li>
                      <li>
                        <label>PayPal customer id</label>
                        <input type="text" value="5JYKZERNQQFNC" />
                      </li>
                      <li>
                        <label>Email Paypal</label>
                        <input
                          type="text"
                          value="florencekevin2610@gmail.com"
                        />
                      </li>
                      <li>
                        <label>First name PayPal</label>
                        <input type="text" value="Kevin" />
                      </li>
                      <li>
                        <label>PayPal Name</label>
                        <input type="text" value="Florence" />
                      </li>
                      <li>
                        <label>Phone Paypal</label>
                        <input type="text" value="75.00" />
                      </li>
                      <li>
                        <label>PayPal country code</label>
                        <input type="text" value="Fr" />
                      </li>
                    </ul>
                  </div>
                  <div className="dashTop">
                    <h2 className="resellerHdn"></h2>
                    <div className="resellerBtns">
                      <button className="saveBtn">Save</button>
                      <button className="trashBtn">Delete</button>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "request" && (
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
                            Date & Time{" "}
                            <img src={DropIcon} alt="" className="dropBtn" />
                          </th>
                          <th>
                            Reason{" "}
                            <img src={DropIcon} alt="" className="dropBtn" />
                          </th>
                          <th>
                            Request{" "}
                            <img src={DropIcon} alt="" className="dropBtn" />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="dashTop orderRequest">
                    <h2 className="resellerHdn"></h2>
                    <div className="resellerBtns">
                      <button className="saveBtn">Save</button>
                      <button className="trashBtn">Delete</button>
                    </div>
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

export default ResellerOrderInfromation;
