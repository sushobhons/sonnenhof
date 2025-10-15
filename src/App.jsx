import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./assets/styles/App.css";
import { ToastContainer } from "react-toastify";

// utils
import { getCurrentUser } from "./utils/getCurrentUser";

// Auth
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// General
import NotFound from "./pages/NotFound";

// Admin
import Dashboard from "./pages/Dashboard";
import CompanyList from "./pages/CompanyList";
import UserList from "./pages/UserList";
import APILogs from "./pages/APILogs";
import Settings from "./pages/Settings";

function App() {
  const user = getCurrentUser();
  // useEffect(() => {
  //   validateDomainUser();
  // }, []);
  return (
    <>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Admin routes */}
          <Route path="admin/dashboard" element={<Dashboard />} />
          <Route path="admin/companies" element={<CompanyList />} />
          <Route path="admin/users" element={<UserList />} />
          <Route path="admin/api-logs" element={<APILogs />} />
          <Route path="admin/settings" element={<Settings />} />
          {/* <Route
            path="/admin/resellers"
            element={
              <GuardedRoute
                element={<AdminResellerList />}
                allowedRoles={["admin"]}
              />
            }
          /> */}

          {/* -------- CUSTOMER (subdomain only) -------- */}
          {/* {!isRootDomain && (
            <>
              <Route
                path="/"
                element={
                  <GuardedRoute
                    element={<BuyFiles />}
                    requiredRoles={["customer", "reseller", "admin"]}
                    allowGuests
                  />
                }
              />
              <Route
                path="/order-history"
                element={
                  <GuardedRoute
                    element={<OrderHistory />}
                    allowedRoles={["customer"]}
                  />
                }
              />
              <Route
                path="/buy-points"
                element={
                  <GuardedRoute
                    element={<BuyPoints />}
                    allowedRoles={["customer"]}
                  />
                }
              />
              <Route
                path="/order-details"
                element={
                  <GuardedRoute
                    element={<OrderDetails />}
                    allowedRoles={["customer"]}
                  />
                }
              />
              <Route
                path="/purchase-points"
                element={
                  <GuardedRoute
                    element={<PurchasePoints />}
                    allowedRoles={["customer"]}
                  />
                }
              />
              <Route
                path="/customer-completed-order-details"
                element={
                  <GuardedRoute
                    element={<CompleteOrderDetails />}
                    allowedRoles={["customer"]}
                  />
                }
              />
              <Route
                path="/customer-canceled-order-details"
                element={
                  <GuardedRoute
                    element={<CanceledOrderDetails />}
                    allowedRoles={["customer"]}
                  />
                }
              />
            </>
          )} */}

          {/* -------- ADMIN (root domain only) -------- */}

          {/* -------- fallback -------- */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <ToastContainer />
      </div>
    </>
  );
}

export default App;
