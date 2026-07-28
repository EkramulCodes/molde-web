'use client';

import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      className="p-1 opacity-50 hover:opacity-100 transition-opacity ml-2"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? <FiMoon size={16} /> : <FiSun size={16} />}
    </button>
  );
}
