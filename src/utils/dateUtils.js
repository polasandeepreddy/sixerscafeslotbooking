// src/utils/dateUtils.js

/**
 * Formats a Date object into "YYYY-MM-DD" string (ISO date).
 * @param {Date} date
 * @returns {string}
 */
export const format = (date) => {
  return date.toISOString().split("T")[0];
};

/**
 * Adds a given number of days to a Date and returns a new Date.
 * @param {Date} date - Original date
 * @param {number} days - Days to add
 * @returns {Date}
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Formats a date string like "2025-05-22" to a readable display format.
 * Example: "Thursday, 22 May 2025"
 * @param {string} dateString
 * @returns {string}
 */
export const formatDisplayDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Handle invalid dates
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/**
 * Converts 24-hour time (e.g., "17:00") to 12-hour format with AM/PM.
 * Example: "5:00 PM"
 * @param {string} time - Time string in "HH:MM" format
 * @returns {string}
 */
export const formatTime12Hour = (time) => {
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (isNaN(hour) || isNaN(minute)) return time;

  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
