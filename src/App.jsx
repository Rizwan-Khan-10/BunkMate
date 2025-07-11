import React, { useState, useEffect } from 'react';
import { TimeTableProvider } from './context/timeTable';
import { SubjectProvider } from './context/subject';
import { AttendanceProvider } from './context/attendance';
import { ThemeProvider } from './context/theme';
import Header from './components/Header';
import { Outlet } from 'react-router-dom';

function App() {
  const [timeTable, setTimeTable] = useState(() => {
    const saved = localStorage.getItem('timeTable');
    return saved ? JSON.parse(saved) : {
      monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: []
    };
  });

  const updateTimeTable = (day, updatedSlots) => {
    const updated = { ...timeTable, [day]: updatedSlots };
    setTimeTable(updated);
    localStorage.setItem('timeTable', JSON.stringify(updated));
  };

  const removeTimeTable = (day) => {
    const updated = { ...timeTable, [day]: [] };
    setTimeTable(updated);
    localStorage.setItem('timeTable', JSON.stringify(updated));
  };

  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('subject');
    return saved ? JSON.parse(saved) : [];
  });

  const addSubject = (subj) => {
    const updated = [...subjects, subj];
    setSubjects(updated);
    localStorage.setItem('subject', JSON.stringify(updated));
  };

  const removeSubject = (id) => {
    const updated = subjects.filter(s => s.id !== id);
    setSubjects(updated);
    localStorage.setItem('subject', JSON.stringify(updated));
  };

  const updateSubject = (id, updatedData) => {
    const updated = subjects.map(s => s.id === id ? { ...s, ...updatedData } : s);
    setSubjects(updated);
    localStorage.setItem('subject', JSON.stringify(updated));
  };

  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem('attendance');
    return saved ? JSON.parse(saved) : [];
  });

  const addAttendance = (date, records) => {
    const existing = attendance.find(a => a.date === date);
    const updated = existing
      ? attendance.map(a => a.date === date ? { ...a, records } : a)
      : [...attendance, { date, records }];

    setAttendance(updated);
    localStorage.setItem('attendance', JSON.stringify(updated));
  };

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleTheme = () => {
    const updated = !isDark;
    setIsDark(updated);
    localStorage.setItem('theme', JSON.stringify(updated));
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <ThemeProvider value={{ isDark, toggleTheme }}>
      <AttendanceProvider value={{ attendance, addAttendance }}>
        <SubjectProvider value={{ subjects, addSubject, removeSubject, updateSubject }}>
          <TimeTableProvider value={{ timeTable, setTimeTable, updateTimeTable, removeTimeTable }}>
            <Header />
            <Outlet />
          </TimeTableProvider>
        </SubjectProvider>
      </AttendanceProvider>
    </ThemeProvider>
  );
}

export default App;