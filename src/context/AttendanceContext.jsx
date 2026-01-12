import { createContext, useContext, useEffect, useState } from "react";

const AttendanceContext = createContext();

export const AttendanceProvider = ({ children }) => {
  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem("attendance");
    return saved ? JSON.parse(saved) : [];
  });

  const addAttendance = (date, records) => {
    const existing = attendance.find(a => a.date === date);
    const updated = existing
      ? attendance.map(a => a.date === date ? { ...a, records } : a)
      : [...attendance, { date, records }];
    setAttendance(updated);
  };

  const removeAttendance = (date) => {
    const updated = attendance.filter(a => a.date !== date);
    setAttendance(updated);
  };

  const removeAllAttendance = () => {
    setAttendance([]);
  }

  useEffect(() => {
    localStorage.setItem("attendance", JSON.stringify(attendance));
  }, [attendance]);

  return (
    <AttendanceContext.Provider value={{ attendance, addAttendance, removeAttendance, removeAllAttendance }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => useContext(AttendanceContext);