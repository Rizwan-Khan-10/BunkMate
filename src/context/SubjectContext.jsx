import { createContext, useContext, useEffect, useState } from "react";

const defaultSubjects = [
  { id: "8adc4c41-cf06-4931-8dcb-5fd1b4612278", name: "Internet Programming", shortCode: "INP", color: "#00c5cc" },
  { id: "859c45bb-bdc3-4731-a2c4-5d63d55dd6b9", name: "Software Engineering ", shortCode: "SE", color: "#00ff66" },
  { id: "5d696407-f579-40f9-936f-b0fe99157e41", name: "Computer Network Security", shortCode: "CNS", color: "#b200ff" },
  { id: "1f84e69a-e3bf-446a-bb6e-a5b06d032543", name: "Entrepreneurship And E-business", shortCode: "EEB", color: "#8cff00" },
  { id: "f00777be-05eb-4615-a8ae-44d56db99a6e", name: "Advanced Data Structure And Analysis", shortCode: "ADSA", color: "#ff00ff" },
  { id: "a559836a-197f-4419-8ebf-3d179b0a4485", name: "IP LAB", shortCode: "IP", color: "#ffffff" },
  { id: "77027342-a6a1-48aa-94b4-f6e7772d8254", name: "SECURITY LAB", shortCode: "SEC", color: "#00ffff" },
  { id: "d5d8ab30-f323-4b29-af67-d42d4e1e83f2", name: "Devops Lab", shortCode: "DOP", color: "#ffff00" },
  { id: "a868c160-d90b-4bc0-b916-75633eb15325", name: "Advance Devops Lab", shortCode: "ADOP", color: "#ff0000" },
  { id: "d79030f1-8515-4748-aeea-727457cb9c97", name: "Professional Communication & Ethics - II", shortCode: "PCE-II", color: "#000000" },
  { id: "cb530896-5732-4c02-a930-ec0fcc0cef9d", name: "Mini Project - 2A", shortCode: "MP2A", color: "#0000ff" },
  { id: "1c7d2078-89a0-4c90-a669-63faa5e9f8e6", name: "Professional Communication & Ethics - II Lab", shortCode: "PCE-II Lab", color: "#00ffd0" }
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

  return (
    <SubjectContext.Provider value={{ subjects, addSubject, updateSubject, removeSubject }}>
      {children}
    </SubjectContext.Provider>
  );
};

export const useSubject = () => useContext(SubjectContext);