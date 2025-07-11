import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaMoon, FaSun, FaBars, FaTimes } from 'react-icons/fa';
import { useTheme } from '../context/theme';

function Header() {
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { name: 'Subject', to: '/' },
    { name: 'Timetable', to: '/timetable' },
    { name: 'Attendance', to: '/attendance' },
    { name: 'Bunk', to: '/bunk' },
  ];

  return (
    <header className="bg-white dark:bg-slate-950 shadow-sm sticky top-0 z-50">
      <div className="w-full px-4 py-3 flex items-center justify-between h-[5rem]">
        <div className="text-xl sm:text-2xl font-bold text-blue-600 tracking-tight">
          Bunk<span className='text-yellow-500'>Mate</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `text-base sm:text-lg font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-500'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

          <button
            onClick={toggleTheme}
            className="text-base sm:text-lg transition-colors text-gray-700 dark:text-gray-200 hover:text-blue-500"
            aria-label="Toggle Theme"
          >
            {isDark ? <FaSun /> : <FaMoon />}
          </button>
        </nav>

        <button
          className="md:hidden text-lg sm:text-xl text-gray-700 dark:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 px-4 pb-4 pt-3 space-y-3">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-500'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

          <button
            onClick={() => {
              toggleTheme();
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 text-sm text-gray-700 dark:text-white hover:text-blue-500"
          >
            {isDark ? <FaSun /> : <FaMoon />} Toggle Theme
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;