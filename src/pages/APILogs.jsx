import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import AdminSidebar from "../layouts/AdminSidebar";
import Header from "../layouts/AdminHeader";
import { useTheme } from "../layouts/ThemeProvider";
import API from "../api/axios";
import { CrossIcon } from "@/assets/images";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const APILogs = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const [loading, setLoading] = useState(false);
  const [pageList, setPageList] = useState([]);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(dayjs());
  const [chartData, setChartData] = useState([]);
  const [selectedAccessId, setSelectedAccessId] = useState(null);

  const getPageAccesses = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/admin/access-list");
      setPageList(data?.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async (accessId, selectedDate) => {
    try {
      const { data } = await API.post("/admin/access-report-by-id", {
        access_id: accessId,
        date: selectedDate,
      });
      setChartData(data?.data || []);
    } catch (err) {
      console.error("Failed to fetch chart data:", err);
    }
  };

  useEffect(() => {
    getPageAccesses();
  }, []);

  useEffect(() => {
    if (open && selectedAccessId) {
      fetchChartData(selectedAccessId, date.format("YYYY-MM-DD"));
    }
  }, [date, open, selectedAccessId]);

  return (
    <div className="main">
      <AdminSidebar />
      <Header pageTitle={t("sidebar.logs")} />
      <div className="container">
        <div className="dashboard-container">
          <div className="table-container">
            <div className="table-wrapper">
              <table className="table">
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={2} className="loading-cell">
                        {t("common.loading")}...
                      </td>
                    </tr>
                  ) : pageList.length > 0 ? (
                    pageList.map((page) => (
                      <tr key={page.id}>
                        <td>{page.access_name}</td>
                        <td>
                          <button
                            className="btn-action btn-view"
                            onClick={() => {
                              setSelectedAccessId(page.id);
                              setOpen(true);
                              fetchChartData(
                                page.id,
                                date.format("YYYY-MM-DD")
                              );
                            }}
                          >
                            {t("common.view")}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2}>{t("common.no_record")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {open && (
            <div className="popup-overlay">
              <div className="popup-container modal-lg">
                <div className="popup-header">
                  <h2>Dashboard</h2>
                  <div className="mb-3">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DesktopDatePicker
                        value={date}
                        onChange={(newValue) => setDate(newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            sx={{
                              "& .MuiInputBase-root": {
                                height: 40,
                                backgroundColor: "var(--color-bg)",
                                color: "var(--color-text)",
                                borderRadius: "8px",
                              },
                              "& input": {
                                color: "var(--color-text)",
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "var(--color-border)",
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "var(--color-primary)",
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: "var(--color-primary)",
                                },
                              "& .MuiSvgIcon-root": {
                                color: "var(--color-text)",
                              },
                            }}
                          />
                        )}
                        slotProps={{
                          popper: {
                            sx: {
                              "& .MuiPaper-root": {
                                backgroundColor: "var(--popup-bg)",
                                color: "var(--popup-text)",
                                borderRadius: "12px",
                                boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                              },
                              "& .MuiPickersDay-root": {
                                color: "var(--popup-text)",
                              },
                              "& .MuiPickersDay-root.Mui-selected": {
                                backgroundColor: "var(--color-primary)",
                                color: "var(--color-primary-text)",
                              },
                              "& .MuiPickersDay-root:hover": {
                                backgroundColor: "var(--color-hover)",
                                color: "var(--color-hover-text)",
                              },
                              "& .MuiTypography-root": {
                                color: "var(--popup-text)",
                              },
                              "& .MuiIconButton-root": {
                                color: "var(--popup-text)",
                              },
                              "& .MuiPickersCalendarHeader-root": {
                                color: "var(--popup-text)",
                              },
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                  <img
                    src={CrossIcon}
                    alt=""
                    className="popup-close"
                    onClick={() => setOpen(false)}
                  />
                </div>

                <div className="popup-body">
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
                        tickLine={false}
                        axisLine={false}
                        interval={2}
                        label={{
                          value: t("chart.time"),
                          position: "insideBottom",
                          offset: -10,
                          style: {
                            fill: "var(--color-text)",
                            fontSize: 13,
                            fontWeight: 600,
                          },
                        }}
                      />
                      <YAxis
                        allowDecimals={false}
                        stroke="var(--color-text)"
                        tick={{ fill: "var(--color-text)", fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        width={50}
                        label={{
                          value: t("chart.api_calls"),
                          angle: -90,
                          position: "insideLeft",
                          style: {
                            fill: "var(--color-text)",
                            fontSize: 13,
                            fontWeight: 600,
                          },
                        }}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default APILogs;
