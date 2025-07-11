import { createContext, useContext } from "react";

export const AttendanceContext = createContext({
    attendance: {},
    addAttendance: () => { },
});

export const useAttendance = () => {
    return useContext(AttendanceContext);
}

export const AttendanceProvider = AttendanceContext.Provider;