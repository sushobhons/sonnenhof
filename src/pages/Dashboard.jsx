import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useTranslation } from "react-i18next";
import useAuth from "../auth/useAuth";
import AdminSidebar from "../layouts/AdminSidebar";
import Header from "../layouts/AdminHeader";
import API from "../api/axios";

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    total_users: 0,
    total_companies: 0,
    total_customers: 0,
    logged_in_users: [],
  });
  const [chartData, setChartData] = useState([]);
  const [filter, setFilter] = useState("7d");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [date, setDate] = useState(dayjs().subtract(1, "day"));

  const getDateRange = (filter) => {
    switch (filter) {
      case "Today":
        return { from: dayjs().startOf("day"), to: dayjs().endOf("day") };
      case "7d":
        return { from: dayjs().subtract(7, "day"), to: dayjs() };
      case "15d":
        return { from: dayjs().subtract(15, "day"), to: dayjs() };
      case "1m":
        return { from: dayjs().subtract(1, "month"), to: dayjs() };
      case "1y":
        return { from: dayjs().subtract(1, "year"), to: dayjs() };
      default:
        return { from: dayjs().subtract(15, "day"), to: dayjs() };
    }
  };

  const getTickFormatter = () => {
    switch (filter) {
      case "Today":
        return (tick) => dayjs(tick).format("HH:mm");
      case "7d":
      case "15d":
      case "1m":
        return (tick) => dayjs(tick).format("MMM DD");
      case "1y":
        return (tick) => dayjs(tick).format("MMM");
      default:
        return (tick) => dayjs(tick).format("MMM DD");
    }
  };

  const fetchDashboard = async () => {
    try {
      const { data } = await API.post("/admin/dashboard");
      if (data?.status) {
        setStats(data.data);
        setFilteredUsers(data.data.logged_in_users);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
    }
  };

  const fetchChartData = async (range) => {
    try {
      const { data } = await API.post("/admin/access-report", {
        from_date: range.from.format("YYYY-MM-DD"),
        to_date: range.to.format("YYYY-MM-DD"),
      });
      setChartData(data?.data || []);
    } catch (err) {
      console.error("Failed to fetch chart data:", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    const range = getDateRange(filter);
    fetchChartData(range);
  }, [filter]);

  useEffect(() => {
    if (searchTerm) {
      setFilteredUsers(
        stats.logged_in_users.filter(
          (user) =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.user_key.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(stats.logged_in_users);
    }
  }, [searchTerm, stats.logged_in_users]);

  return (
    <div className="main">
      <AdminSidebar />
      <Header pageTitle="Dashboard" />

      <div className="container">
        <div className="dashboard-container">
          <div className="dashboard-top-section">
            <div className="card" style={{ flex: 3 }}>
              <div className="card-body">
                <ul className="chart-filter">
                  {["Today", "7d", "15d", "1m", "1y"].map((label) => (
                    <li
                      key={label}
                      className={`chart-filter-item ${
                        filter === label ? "active" : ""
                      }`}
                    >
                      <button
                        className="chart-filter-btn"
                        onClick={() => setFilter(label)}
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>

                <h4 className="header-title">{t("Sessions Overview")}</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient
                        id="areaGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="var(--chart-gradient-start)"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--chart-gradient-end)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="var(--chart-grid)"
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="time"
                      stroke="var(--color-text)"
                      tick={{ fill: "var(--color-text)", fontSize: 12 }}
                      tickFormatter={getTickFormatter()}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      allowDecimals={false}
                      stroke="var(--color-text)"
                      tick={{ fill: "var(--color-text)", fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      width={50}
                    />
                    <Tooltip
                      cursor={{
                        stroke: "var(--chart-line)",
                        strokeWidth: 1,
                        strokeDasharray: "4",
                      }}
                      content={({ active, payload }) =>
                        active && payload && payload.length ? (
                          <div
                            style={{
                              background: "#fff",
                              color: "#333",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                              fontSize: "13px",
                              fontWeight: 500,
                            }}
                          >
                            {t("chart.api_calls")}: {payload[0].value}
                          </div>
                        ) : null
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="calls"
                      stroke="var(--chart-line)"
                      strokeWidth={2}
                      fill="url(#areaGradient)"
                      activeDot={{
                        r: 5,
                        fill: "var(--chart-line)",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="stats-cards">
              <div className="stats-card">
                <h4>{t("total.users")}</h4>
                <h2>{stats.total_users}</h2>
              </div>
              <div className="stats-card">
                <h4>{t("total.companies")}</h4>
                <h2>{stats.total_companies}</h2>
              </div>
              <div className="stats-card">
                <h4>{t("total.customers")}</h4>
                <h2>{stats.total_customers}</h2>
              </div>
            </div>
          </div>

          <div className="table-container">
            <div className="table-header">
              <h3 className="table-title">{t("users.logged_list")}</h3>
              <div className="table-actions">
                <input
                  type="text"
                  className="search-input"
                  placeholder={t("common.search_placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>{t("users.username")}</th>
                  <th>{t("users.user_id")}</th>
                  <th>{t("users.last_login")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr key={index}>
                      <td>{user.username}</td>
                      <td>{user.user_key}</td>
                      <td>
                        {dayjs(user.last_login).format("DD MMM, YYYY | HH:mm")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center" }}>
                      {t("common.result.no_record")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
