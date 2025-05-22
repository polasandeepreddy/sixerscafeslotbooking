// src/utils/mockData.js

import { format, addDays } from "./dateUtils";

export const generateSlotsForDate = (date) => {
  const slots = [];
  for (let hour = 6; hour <= 22; hour++) {
    const timeString = `${hour.toString().padStart(2, "0")}:00`;
    slots.push({
      id: `${date}-${timeString}`,
      time: timeString,
      isAvailable: true,
      price: 600,
      date,
    });
  }
  return slots;
};

export const generateAvailableDates = () => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    dates.push(format(addDays(new Date(), i)));
  }
  return dates;
};
