import { TimeTableProvider } from './context/TimeTableContext';
import { SubjectProvider } from './context/SubjectContext';
import { AttendanceProvider } from './context/AttendanceContext';
import { ThemeProvider } from './context/theme';
import Header from './components/Header';
import { Outlet } from 'react-router-dom';
import { useState,useEffect } from 'react';

function App() {
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
    <ThemeProvider value={{isDark,toggleTheme}}>
      <AttendanceProvider>
        <SubjectProvider>
          <TimeTableProvider>
            <Header />
            <Outlet />
          </TimeTableProvider>
        </SubjectProvider>
      </AttendanceProvider>
    </ThemeProvider>
  );
}

export default App;