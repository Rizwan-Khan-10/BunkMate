import { createContext, useContext } from "react";

export const SubjectContext = createContext({
    subjects: [],
    addSubject: () => { },
    removeSubject: () => { },
    updateSubject: () => { }
});

export const useSubject = () => {
    return useContext(SubjectContext);
}

export const SubjectProvider = SubjectContext.Provider;