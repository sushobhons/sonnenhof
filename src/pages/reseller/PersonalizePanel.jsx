import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../auth/useAuth";
import { useTranslation } from "react-i18next";
import ResellerSidebar from "../../layouts/ResellerSidebar";
import ResellerHeader from "../../layouts/ResellerHeader";

import TrashIcon from "../../assets/images/delete-icon3.svg"; // Replace with your icons
import PlusIcon from "../../assets/images/plus-icon2.svg";
import loaderImg from "../../assets/images/loader.gif";
import { toast } from "react-toastify";
import API from "../../api/axios";
import { IMAGE_URL } from "../../utils/apiUrl";

const PersonalizePanel = () => {
  const { t } = useTranslation();
  const { updateUser } = useAuth();

  const fileInputRef = useRef(null);
  const colorInputRef = useRef(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  // const [bgColor, setBgColor] = useState("#0F0F0F");
  const [selectedFileType, setSelectedFileType] = useState(""); // "file" or "folder"
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);
  const [imageUploadLoader, setImageUploadLoader] = useState(false);
  const [personalizeData, setPersonalizeData] = useState({
    logo: "",
    logoName: "",
    bgColor: "#0F0F0F",
    profileImage: "",
  });

  const triggerFileInput = (type) => {
    setSelectedFileType(type);
    if (fileInputRef.current) {
      // Remove attributes first
      fileInputRef.current.removeAttribute("webkitdirectory");
      fileInputRef.current.removeAttribute("directory");
      fileInputRef.current.removeAttribute("multiple");

      if (type === "folder") {
        fileInputRef.current.setAttribute("webkitdirectory", "");
        fileInputRef.current.setAttribute("directory", "");
      } else {
        fileInputRef.current.setAttribute("multiple", "");
      }
      fileInputRef.current.click();
    }
  };

  const handleLogoUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (file) {
        const fileType = file.type.split("/")[0];
        if (fileType === "image") {
          const imageUrl = URL.createObjectURL(file);
          try {
            setImageUploadLoader(true);
            const formData = new FormData();
            formData.append("logo", event.target.files[0]);
            const apiRes = await API.post(
              `/reseller/profile-picture`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/formdata",
                },
              }
            );

            if (apiRes.data.status) {
              toast.success(apiRes.data.message, {
                autoClose: 2000,
              });
              const newLogo = apiRes.data.data?.logo;
              if (newLogo) {
                updateUser({ reseller_logo: newLogo });
              }
              fetchAccountDetails();
            }
          } catch (error) {
            toast.error(apiRes.data.message, {
              autoClose: 2000,
            });
          } finally {
            setImageUploadLoader(false);
          }
        } else {
          toast.error("Please upload a valid image file", {
            autoClose: 2000,
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFiles([]);
    setSelectedNames([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const predefinedColors = [
    "#576cac",
    "#d10d5b",
    "#129903",
    "#c71010",
    "#1E4F73",
    "#1E4F2E",
    "#d26900",
    "#908014",
    "#6908f2",
    "#2c114a",
    "#6e6c6c",
    "#1f1f1f",
  ];

  const handlePredefinedColorClick = async (color) => {
    try {
      setPersonalizeData((prev) => ({
        ...prev,
        bgColor: color,
      }));
      setShowColorPicker(false);

      const formData = new FormData();
      formData.append("admin_panel_color", color);
      const apiRes = await API.post(`/reseller/profile-picture`, formData);
      if (apiRes.data.status) {
        const newBGColor = apiRes.data.data?.admin_panel_color;
        if (newBGColor) {
          updateUser({ reseller_background_color: newBGColor });
        }
        toast.success(apiRes.data.message, {
          theme: "dark",
          autoClose: 2000,
        });
      } else {
        toast.error("Please upload a valid color", {
          theme: "dark",
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fileName = (name) => {
    let file = name.split("/").pop();
    return file;
  };

  const fetchAccountDetails = async () => {
    try {
      const apiRes = await API.get(`/reseller/profile`);
      if (apiRes.data.success) {
        setPersonalizeData({
          logo: IMAGE_URL + apiRes.data.data.logo,
          logoName: fileName(IMAGE_URL + apiRes.data.data.logo),
          bgColor: apiRes.data.data.admin_panel_color,
          profileImage: apiRes.data.data.profile_pic,
        });
      } else {
        toast.error(apiRes?.data?.message, {
          theme: "dark",
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onProfileImgUpdate = (val) => {
    if (val) {
      fetchAccountDetails();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorInputRef.current &&
        !colorInputRef.current.contains(event.target)
      ) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchAccountDetails();
  }, []);

  return (
    <div className="fullWidth">
      <div className="main">
        <ResellerSidebar />
        <div className="container">
          <ResellerHeader pageTitle={t("sidebar.settings")} />
          <div className="mainInnerDiv">
            <div className="resellerNav settingNav">
              <ul>
                <li>
                  <Link to="/admin/settings">Account settings</Link>
                </li>
                <li>
                  <Link to="/admin/personalize-panel" className="active">
                    Personalize panel
                  </Link>
                </li>
              </ul>
            </div>

            <div className="resellerForm holderContainer alertForm panelColor">
              <ul>
                <li>
                  <label>Logo</label>

                  {/* {selectedNames.length > 0 && (
                      <div className="selectedFiles personalSelect">
                        {selectedNames.map((name, idx) => (
                          <div key={idx} className="fileName">
                            {name}
                          </div>
                        ))}
                      </div>
                    )} */}

                  {/* {selectedNames.length > 0 && (
                      <button
                        className="iconBtn delete"
                        onClick={handleRemoveFile}
                      >
                        <img src={TrashIcon} alt="Delete" />
                      </button>
                    )} */}

                  <div
                    className="customUpload"
                    style={{
                      cursor: imageUploadLoader ? "not-allowed" : "cursor",
                    }}
                  >
                    {imageUploadLoader ? (
                      <>
                        <img
                          src={loaderImg}
                          alt="Profile Preview"
                          style={{ width: "77px", height: "46px" }}
                        />
                        <p
                          style={{
                            marginTop: "0px",
                            marginLeft: "-26px",
                          }}
                        >
                          uploading...
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="uploadLabel">
                          {personalizeData?.logoName
                            ? personalizeData?.logoName
                            : "Upload Image"}
                        </span>
                        <button
                          className="iconBtn add"
                          onClick={() => triggerFileInput("file")}
                        >
                          <img src={PlusIcon} alt="Add File" />
                        </button>

                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleLogoUpload}
                          style={{ display: "none" }}
                        />
                      </>
                    )}
                  </div>
                </li>
                <li ref={colorInputRef} style={{ position: "relative" }}>
                  <label>Bg Color</label>
                  <input
                    type="color"
                    value={personalizeData?.bgColor}
                    readOnly
                    onClick={(e) => {
                      e.preventDefault();
                      setShowColorPicker(!showColorPicker);
                    }}
                    style={{ cursor: "pointer" }}
                  />
                  {showColorPicker && (
                    <div className="colorTooltip">
                      {predefinedColors.map((color, idx) => (
                        <div
                          key={idx}
                          onClick={() => handlePredefinedColorClick(color)}
                          style={{
                            backgroundColor: color,
                            width: "41px",
                            height: "28px",
                            borderRadius: "0",
                            cursor: "pointer",
                            border: "2px solid #E1E1E2",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizePanel;
