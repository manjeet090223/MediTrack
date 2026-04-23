export const formatDate = (date, format = "short") => {
  if (!date) return "";
  const d = new Date(date);

  if (format === "short") {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  if (format === "long") {
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  if (format === "time") {
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }

  return d.toLocaleDateString("en-US");
};

export const formatTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};

export const getRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;

  return formatDate(date, "short");
};

export const getTrendIndicator = (current, previous) => {
  if (!previous || previous === 0) return { trend: "neutral", percentage: 0 };

  const percentageChange = ((current - previous) / previous) * 100;

  return {
    trend: percentageChange > 0 ? "up" : percentageChange < 0 ? "down" : "neutral",
    percentage: Math.abs(percentageChange).toFixed(1)
  };
};

export const formatPercentage = (value, decimals = 0) => {
  return `${parseFloat(value).toFixed(decimals)}%`;
};

export const formatNumber = (num, decimals = 0) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + "K";
  }
  return num.toFixed(decimals);
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

export const getStatusBadgeColor = (status) => {
  const statusMap = {
    completed: "success",
    scheduled: "info",
    pending: "warning",
    cancelled: "danger",
    confirmed: "success",
    active: "info",
    inactive: "danger"
  };

  return statusMap[status?.toLowerCase()] || "neutral";
};

export const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

export const generateGradient = (type = "primary") => {
  const gradients = {
    primary: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
    success: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    warning: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    danger: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
    info: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
    neutral: "linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)"
  };

  return gradients[type] || gradients.neutral;
};

export const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
};

export const getHealthScoreColor = (score) => {
  if (score >= 80) return "success";
  if (score >= 60) return "info";
  if (score >= 40) return "warning";
  return "danger";
};
