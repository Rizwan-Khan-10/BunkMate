import { createContext, useContext, useEffect, useState } from "react";

const defaultTimeTable = {
  monday: [
    { subjectId: "5d696407-f579-40f9-936f-b0fe99157e41", startTime: "10:00", endTime: "11:00" },
    { subjectId: "a868c160-d90b-4bc0-b916-75633eb15325", startTime: "11:00", endTime: "13:00" },
    { subjectId: "1f84e69a-e3bf-446a-bb6e-a5b06d032543", startTime: "14:00", endTime: "15:00" },
    { subjectId: "859c45bb-bdc3-4731-a2c4-5d63d55dd6b9", startTime: "15:00", endTime: "16:00" },
  ],
  tuesday: [
    { subjectId: "f00777be-05eb-4615-a8ae-44d56db99a6e", startTime: "09:00", endTime: "11:00" },
    { subjectId: "1c7d2078-89a0-4c90-a669-63faa5e9f8e6", startTime: "11:00", endTime: "13:00" },
    { subjectId: "1f84e69a-e3bf-446a-bb6e-a5b06d032543", startTime: "14:00", endTime: "15:00" },
    { subjectId: "8adc4c41-cf06-4931-8dcb-5fd1b4612278", startTime: "15:00", endTime: "17:00" },
  ],
  wednesday: [
    { subjectId: "1f84e69a-e3bf-446a-bb6e-a5b06d032543", startTime: "09:00", endTime: "10:00" },
    { subjectId: "5d696407-f579-40f9-936f-b0fe99157e41", startTime: "10:00", endTime: "11:00" },
    { subjectId: "d5d8ab30-f323-4b29-af67-d42d4e1e83f2", startTime: "11:00", endTime: "13:00" },
    { subjectId: "859c45bb-bdc3-4731-a2c4-5d63d55dd6b9", startTime: "14:00", endTime: "16:00" },
  ],
  thursday: [
    { subjectId: "d79030f1-8515-4748-aeea-727457cb9c97", startTime: "09:00", endTime: "11:00" },
    { subjectId: "77027342-a6a1-48aa-94b4-f6e7772d8254", startTime: "11:00", endTime: "13:00" },
    { subjectId: "8adc4c41-cf06-4931-8dcb-5fd1b4612278", startTime: "14:00", endTime: "15:00" },
    { subjectId: "cb530896-5732-4c02-a930-ec0fcc0cef9d", startTime: "15:00", endTime: "16:00" },
  ],
  friday: [
    { subjectId: "5d696407-f579-40f9-936f-b0fe99157e41", startTime: "10:00", endTime: "11:00" },
    { subjectId: "a559836a-197f-4419-8ebf-3d179b0a4485", startTime: "11:00", endTime: "13:00" },
    { subjectId: "f00777be-05eb-4615-a8ae-44d56db99a6e", startTime: "14:00", endTime: "15:00" },
    { subjectId: "859c45bb-bdc3-4731-a2c4-5d63d55dd6b9", startTime: "15:00", endTime: "17:00" },
  ],
  saturday: []
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

  return (
    <TimeTableContext.Provider value={{ timeTable, setTimeTable, updateTimeTable, removeTimeTable }}>
      {children}
    </TimeTableContext.Provider>
  );
};

export const useTimeTable = () => useContext(TimeTableContext);