import { useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../../layouts/AdminSidebar";
import Header from "../../layouts/AdminHeader";

import BackIcon from "../../assets/images/back-btn.svg";
import CrossIcon from "../../assets/images/cross-icon.svg";
import FolderIcon from "../../assets/images/folder-img.svg";
import Doc1 from "../../assets/images/doc-img1.svg";
import Doc2 from "../../assets/images/doc-img2.svg";

function AdminDocuments() {
  const [addShowPopup, addSetShowPopup] = useState(false);

  const openAddNewPopup = () => {
    addSetShowPopup(true);
  };
  const closeAddNewPopup = () => {
    addSetShowPopup(false);
  };

  return (
    <div className="fullWidth">
      <div className="main">
        <AdminSidebar />
        <div className="container">
          <Header pageTitle="Documents" />
          <div className="mainInnerDiv">
            <div className="resellerInner">
              <div className="dashTop">
                <h2 className="resellerHdn">
                  <Link to="">
                    <img src={BackIcon} alt="" />
                  </Link>
                </h2>

                <div className="resellerBtns">
                  <button className="addDocBtn">Add a document</button>
                  <button className="addFolderBtn">Create new folder</button>
                  <button className="trashBtn">Delete</button>
                </div>
              </div>

              <div className="documentDiv">
                <ul>
                  <li>
                    <Link to="/admin/document-details">
                      <img src={FolderIcon} alt="" />
                      <h3>###DEFAULT_FOLDE</h3>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/document-details">
                      <img src={FolderIcon} alt="" />
                      <h3>###DEFAULT_FOLDE</h3>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/document-details">
                      <img src={FolderIcon} alt="" />
                      <h3>###DEFAULT_FOLDE</h3>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/document-details">
                      <img src={FolderIcon} alt="" />
                      <h3>###DEFAULT_FOLDE</h3>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/document-details">
                      <img src={FolderIcon} alt="" />
                      <h3>###DEFAULT_FOLDE</h3>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/document-details">
                      <img src={FolderIcon} alt="" />
                      <h3>###DEFAULT_FOLDE</h3>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/document-details">
                      <img src={FolderIcon} alt="" />
                      <h3>###DEFAULT_FOLDE</h3>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/document-details">
                      <img src={FolderIcon} alt="" />
                      <h3>###DEFAULT_FOLDE</h3>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/document-details">
                      <img src={FolderIcon} alt="" />
                      <h3>###DEFAULT_FOLDE</h3>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/document-details">
                      <img src={FolderIcon} alt="" />
                      <h3>###DEFAULT_FOLDE</h3>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/document-details">
                      <img src={FolderIcon} alt="" />
                      <h3>###DEFAULT_FOLDE</h3>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/document-details">
                      <img src={FolderIcon} alt="" />
                      <h3>###DEFAULT_FOLDE</h3>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/document-details">
                      <img src={FolderIcon} alt="" />
                      <h3>###DEFAULT_FOLDE</h3>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/document-details">
                      <img src={FolderIcon} alt="" />
                      <h3>###DEFAULT_FOLDE</h3>
                    </Link>
                  </li>
                  <li>
                    <img src={Doc1} alt="" onClick={openAddNewPopup} />
                    <h3>###DEFAULT_FOLDE</h3>
                  </li>
                  <li>
                    <img src={Doc2} alt="" onClick={openAddNewPopup} />
                    <h3>###DEFAULT_FOLDE</h3>
                  </li>
                  <li>
                    <img src={Doc1} alt="" onClick={openAddNewPopup} />
                    <h3>###DEFAULT_FOLDE</h3>
                  </li>
                  <li>
                    <img src={Doc2} alt="" onClick={openAddNewPopup} />
                    <h3>###DEFAULT_FOLDE</h3>
                  </li>
                  <li>
                    <img src={Doc1} alt="" onClick={openAddNewPopup} />
                    <h3>###DEFAULT_FOLDE</h3>
                  </li>
                  <li>
                    <img src={Doc2} alt="" onClick={openAddNewPopup} />
                    <h3>###DEFAULT_FOLDE</h3>
                  </li>
                  <li>
                    <img src={Doc2} alt="" onClick={openAddNewPopup} />
                    <h3>###DEFAULT_FOLDE</h3>
                  </li>
                  <li>
                    <img src={Doc2} alt="" onClick={openAddNewPopup} />
                    <h3>###DEFAULT_FOLDE</h3>
                  </li>
                  <li>
                    <img src={Doc2} alt="" onClick={openAddNewPopup} />
                    <h3>###DEFAULT_FOLDE</h3>
                  </li>
                  <li>
                    <img src={Doc2} alt="" onClick={openAddNewPopup} />
                    <h3>###DEFAULT_FOLDE</h3>
                  </li>
                  <li>
                    <Link to="/admin/document-details">
                      <img src={FolderIcon} alt="" />
                      <h3>###DEFAULT_FOLDE</h3>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/document-details">
                      <img src={FolderIcon} alt="" />
                      <h3>###DEFAULT_FOLDE</h3>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/document-details">
                      <img src={FolderIcon} alt="" />
                      <h3>###DEFAULT_FOLDE</h3>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/document-details">
                      <img src={FolderIcon} alt="" />
                      <h3>###DEFAULT_FOLDE</h3>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/document-details">
                      <img src={FolderIcon} alt="" />
                      <h3>###DEFAULT_FOLDE</h3>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/document-details">
                      <img src={FolderIcon} alt="" />
                      <h3>###DEFAULT_FOLDE</h3>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {addShowPopup && (
          <div className="popupOverlay">
            <div className="popupContent2 docPop">
              <div className="popupHeader">
                <h2>(3)(2)(13)aaa.jpg</h2>
                <img
                  src={CrossIcon}
                  alt=""
                  className="closeBtn"
                  onClick={closeAddNewPopup}
                />
              </div>

              <div className="popupImg">
                <img src={Doc2} alt="" />
              </div>

              <div className="dashTop orderRequest">
                <h2 className="resellerHdn"></h2>
                <div className="resellerBtns">
                  <button className="downloadBtn">Download</button>
                  <button className="trashBtn">Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDocuments;
