import { createContext, useContext, useEffect, useState } from "react";

const defaultTimeTable = {
  monday: [
    { subjectId: "ITC601", startTime: "10:00", endTime: "11:00" },
    { subjectId: "ITL604", startTime: "11:00", endTime: "13:00" },
    { subjectId: "ITC604", startTime: "14:00", endTime: "15:00" },
    { subjectId: "ITDO6014", startTime: "15:00", endTime: "16:00" },
    { subjectId: "ITM601", startTime: "16:00", endTime: "17:00" },
  ],
  tuesday: [
    { subjectId: "ITC602", startTime: "09:00", endTime: "11:00" },
    { subjectId: "ITL602", startTime: "11:00", endTime: "13:00" },
    { subjectId: "ITC604", startTime: "14:00", endTime: "15:00" },
    { subjectId: "ITDo6014", startTime: "15:00", endTime: "16:00" },
  ],
  wednesday: [
    { subjectId: "ITC601", startTime: "10:00", endTime: "11:00" },
    { subjectId: "ITL605", startTime: "11:00", endTime: "13:00" },
    { subjectId: "ITC604", startTime: "14:00", endTime: "15:00" },
    { subjectId: "ITDO6014", startTime: "15:00", endTime: "16:00" },
    { subjectId: "ITM601", startTime: "16:00", endTime: "17:00" },
  ],
  thursday: [
    { subjectId: "ITC603", startTime: "10:00", endTime: "11:00" },
    { subjectId: "ITL603", startTime: "11:00", endTime: "13:00" },
    { subjectId: "ITC602", startTime: "14:00", endTime: "15:00" },
    { subjectId: "ITL601", startTime: "15:00", endTime: "17:00" },
  ],
  friday: [
    { subjectId: "ITC603", startTime: "11:00", endTime: "13:00" },
    { subjectId: "ITC604", startTime: "14:00", endTime: "15:00" },
    { subjectId: "ITM601", startTime: "15:00", endTime: "16:00" },
  ]
};

const TimeTableContext = createContext();

export const TimeTableProvider = ({ children }) => {
  const [timeTable, setTimeTable] = useState(() => {
    const saved = localStorage.getItem("timeTable");
    return saved ? JSON.parse(saved) : defaultTimeTable;
  });

  useEffect(() => {
    localStorage.setItem("timeTable", JSON.stringify(timeTable));
  }, [timeTable]);

  const updateTimeTable = (day, newSlots) => {
    setTimeTable(prev => ({ ...prev, [day]: newSlots }));
  };

  const removeTimeTable = (day) => {
    setTimeTable(prev => ({ ...prev, [day]: [] }));
  };

  const removeCompleteTimeTable = () => {
    setTimeTable(defaultTimeTable);
  }

  return (
    <TimeTableContext.Provider value={{ timeTable, setTimeTable, updateTimeTable, removeTimeTable, removeCompleteTimeTable }}>
      {children}
    </TimeTableContext.Provider>
  );
};

export const useTimeTable = () => useContext(TimeTableContext);