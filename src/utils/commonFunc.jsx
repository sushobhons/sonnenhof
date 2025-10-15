export const formatDate = (dateString) => {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day} ${month}, ${year} | ${hours}:${minutes}`;
};

export const downloadFile = async (fileUrl, fileName) => {
  try {
    const response = await fetch(fileUrl, {
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName ? fileName : fileUrl.split("/").pop();

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
  }
};

export const dateTimeDisplay = (dateTime, type) => {
  const isoDate = dateTime;
  const dateObj = new Date(isoDate);
  if (type == "date") {
    const formattedDate = dateObj.toLocaleDateString("en-GB"); // '19/07/2025'
    return formattedDate;
  } else if (type == "time") {
    // Format time as hh:mm:ss
    const formattedTime = dateObj.toLocaleTimeString("en-GB", {
      hour12: false, // 24-hour format
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }); // '09:03:17'
    return formattedTime;
  } else {
    console.error("Type Error: " + type);
  }
};

export const getParsedOtherServices = (services) => {
  if (!services || services.length === 0) return null;

  const isCleanArray = services.every(
    (item) =>
      typeof item === "string" &&
      !item.includes("[") &&
      !item.includes("]") &&
      !item.includes("\\")
  );

  if (isCleanArray) return services.join(", ");

  try {
    // ✅ Join with a comma to fix malformed string
    const combined = services.join(",");
    const parsed = JSON.parse(combined); // Now it's valid JSON

    if (Array.isArray(parsed)) {
      return parsed.join(", ");
    }
  } catch (error) {
    console.error("Failed to parse other_services:", error);
  }

  return null;
};
