import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  initialize: () => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveTheme = (theme: Theme): 'light' | 'dark' => {
  return theme === 'system' ? getSystemTheme() : theme;
};

const applyTheme = (theme: 'light' | 'dark') => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'system',
  resolvedTheme: 'light',

  setTheme: (theme: Theme) => {
    const resolved = resolveTheme(theme);
    applyTheme(resolved);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
    
    set({ theme, resolvedTheme: resolved });
  },

  initialize: () => {
    if (typeof window === 'undefined') return;

    // Get saved theme from localStorage or default to system
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'system';
    const resolved = resolveTheme(savedTheme);
    
    applyTheme(resolved);
    set({ theme: savedTheme, resolvedTheme: resolved });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const { theme } = get();
      if (theme === 'system') {
        const newResolved = getSystemTheme();
        applyTheme(newResolved);
        set({ resolvedTheme: newResolved });
      }
    };

    mediaQuery.addEventListener('change', handleChange);
  },
}));
