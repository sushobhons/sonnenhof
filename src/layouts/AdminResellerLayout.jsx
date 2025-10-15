import { useParams, Outlet, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import Header from "./AdminHeader";
import AdminResellerNav from "./AdminResellerNav";
import { BackIcon, defaultProfileImg } from "@/assets/images";
import API from "../api/axios";
import { useTranslation } from "react-i18next";
import Skeleton from "@mui/material/Skeleton";
import Avatar from "@mui/material/Avatar";

const AdminResellerLayout = () => {
  const publicUrl = import.meta.env.VITE_PUBLIC_URL;
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const { t } = useTranslation();
  const { id } = useParams();
  const [reseller, setReseller] = useState(null);

  const getResellerDetails = async () => {
    try {
      const res = await API.get(`/admin/resellers/${id}`);
      setReseller(res.data.data);
    } catch (err) {
      console.error("Failed to fetch reseller:", err);
    }
  };

  const subDomain = reseller?.user?.username;

  useEffect(() => {
    getResellerDetails();
  }, [id]);

  // if (!reseller) return <div>Loading...</div>;

  return (
    <>
      <div className="fullWidth">
        <div className="main">
          <AdminSidebar />
          <div className="container">
            <Header pageTitle={t("sidebar.resellers")} />
            <div className="mainInnerDiv">
              <div className="dashTop">
                <h2 className="resellerHdn">
                  <Link to="/admin/resellers">
                    <img src={BackIcon} alt="Back" />
                  </Link>
                  {!reseller ? (
                    <>
                      <Skeleton variant="circular">
                        <Avatar />
                      </Skeleton>
                      <Skeleton variant="rectangular" width={210} height={30} />
                    </>
                  ) : (
                    <>
                      <img
                        src={
                          reseller.profile_pic
                            ? reseller.profile_pic
                            : defaultProfileImg
                        }
                        alt=""
                        width={32}
                        style={{ borderRadius: "20px" }}
                      />
                      {reseller.user?.name}
                    </>
                  )}
                </h2>

                <div className="resellerBtns">
                  <Link
                    className="accessBtn"
                    to={`https://${subDomain}.file-service-portal.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("reseller.access_panel")}
                  </Link>

                  <button className="trashBtn">{t("common.delete")}</button>
                </div>
              </div>

              <AdminResellerNav id={id} />

              <div className="resellerContent">
                <Outlet
                  context={{ reseller, setReseller, getResellerDetails }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminResellerLayout;
