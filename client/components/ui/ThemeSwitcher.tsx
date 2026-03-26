'use client';

import { useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import Dropdown from './Dropdown';

export default function ThemeSwitcher() {
  const { theme, setTheme, initialize } = useThemeStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const items = [
    {
      label: 'Light',
      icon: <Sun className="w-4 h-4" />,
      onClick: () => setTheme('light'),
    },
    {
      label: 'Dark',
      icon: <Moon className="w-4 h-4" />,
      onClick: () => setTheme('dark'),
    },
    {
      label: 'System',
      icon: <Monitor className="w-4 h-4" />,
      onClick: () => setTheme('system'),
    },
  ];

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5" />;
      case 'dark':
        return <Moon className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <Dropdown
      trigger={
        <button
          className="p-2 rounded-md hover:bg-muted transition-colors"
          aria-label="Toggle theme"
        >
          {getIcon()}
        </button>
      }
      items={items}
      align="end"
    />
  );
}
