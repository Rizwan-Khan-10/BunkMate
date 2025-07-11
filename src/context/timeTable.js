import { createContext, useContext } from "react";

export const TimeTableContext = createContext({
    timeTable: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [] },
    setTimeTable: () => { },
    updateTimeTable: () => { },
    removeTimeTable: () => { }
});

export const useTimeTable = () => {
    return useContext(TimeTableContext);
}

export const TimeTableProvider = TimeTableContext.Provider;