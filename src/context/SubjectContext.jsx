import { createContext, useContext, useEffect, useState } from "react";

const defaultSubjects = [
  { id: "ITC601", name: "Data Mining & Business Intelligence", shortCode: "DBMI", color: "#00c5cc" },
  { id: "ITC602", name: "Web X.0", shortCode: "WEBX", color: "#00ff66" },
  { id: "ITC603", name: "Wireless Technology", shortCode: "WT", color: "#b200ff" },
  { id: "ITC604", name: "Artificial Intelligence & Data Science 1", shortCode: "AIDS-1", color: "#8cff00" },
  { id: "ITDO6014", name: "Ethical Hacking & Forensic", shortCode: "EHF", color: "#ff00ff" },
  { id: "ITL601", name: "Business Intelligence Lab", shortCode: "BI", color: "#ffffff" },
  { id: "ITL602", name: "Web LAB", shortCode: "WB", color: "#00ffff" },
  { id: "ITL603", name: "Sensor Lab", shortCode: "SR", color: "#ffff00" },
  { id: "ITL604", name: "MAD & PWA Lab", shortCode: "MDPW", color: "#000000" },
  { id: "ITL605", name: "DS using Python Lab", shortCode: "DS", color: "#ff0000" },
  { id: "ITM601", name: "Mini Project - 2B", shortCode: "MP2B", color: "#0000ff" },
];

const SubjectContext = createContext();

export const SubjectProvider = ({ children }) => {
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem("subject");
    return saved ? JSON.parse(saved) : defaultSubjects;
  });

  useEffect(() => {
    localStorage.setItem("subject", JSON.stringify(subjects));
  }, [subjects]);

  const addSubject = (subject) => setSubjects(prev => [...prev, subject]);

  const updateSubject = (id, updated) => {
    setSubjects(prev => prev.map(sub => sub.id === id ? { ...sub, ...updated } : sub));
  };

  const removeSubject = (id) => {
    setSubjects(prev => prev.filter(sub => sub.id !== id));
  };

  const removeAllSubjects = () => {
    setSubjects(defaultSubjects);
  }

  return (
    <SubjectContext.Provider value={{ subjects, addSubject, updateSubject, removeSubject, removeAllSubjects }}>
      {children}
    </SubjectContext.Provider>
  );
};

export const useSubject = () => useContext(SubjectContext);