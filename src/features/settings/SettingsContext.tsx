import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { supabase } from '@/supabase/supabase';
import { useAuth } from '@/features/auth/AuthContext';

// ==========================================
// TYPES
// ==========================================
export type ThemeMode = 'light' | 'dark';

interface SettingsContextType {
  // Class Place
  classPlace: string;
  setClassPlace: (place: string) => void;
  saveClassPlace: (place: string) => Promise<void>;

  // Theme
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  saveTheme: (theme: ThemeMode) => Promise<void>;

  // Loading
  isLoading: boolean;
}

// ==========================================
// CONTEXT
// ==========================================
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// ==========================================
// HELPERS
// ==========================================
const LS_THEME_KEY = 'nd_theme';
const LS_PLACE_KEY = 'nd_class_place';

// Sentinel to detect whether the user has ever saved a custom place.
// If this key is present in localStorage, we trust it over the DB value.
const LS_PLACE_SAVED_KEY = 'nd_class_place_saved';

const DEFAULT_PLACE = 'Place Name';

const getStoredTheme = (): ThemeMode => {
  try {
    const stored = localStorage.getItem(LS_THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {}
  return 'light';
};

const getStoredPlace = (): string => {
  try {
    return localStorage.getItem(LS_PLACE_KEY) || DEFAULT_PLACE;
  } catch {
    return DEFAULT_PLACE;
  }
};

// ==========================================
// PROVIDER
// ==========================================
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();

  const [classPlace, setClassPlaceState] = useState<string>(getStoredPlace);
  const [theme, setThemeState] = useState<ThemeMode>(getStoredTheme);
  const [isLoading, setIsLoading] = useState(false);

  // ── Apply dark class and update theme-color meta tag on theme change ──
  useEffect(() => {
    const root = document.documentElement;
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }

    if (theme === 'dark') {
      root.classList.add('dark');
      metaThemeColor.setAttribute('content', '#0f172a');
    } else {
      root.classList.remove('dark');
      metaThemeColor.setAttribute('content', '#ffffff');
    }
    try {
      localStorage.setItem(LS_THEME_KEY, theme);
    } catch {}
  }, [theme]);

  // ── Load settings from Supabase once profile is available ──
  // Only syncs the DB value when the user has never saved a custom place locally.
  // This prevents a stale or null DB value from overwriting the user's last saved choice.
  useEffect(() => {
    const orgId = profile?.organization_id;
    if (!orgId) return;

    const loadOrgSettings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('location, name')
          .eq('id', orgId)
          .single<{ location: string | null; name: string }>();

        if (error) throw error;

        if (data?.location) {
          // Only apply DB value if the user has NOT already saved a custom place locally.
          // If LS_PLACE_SAVED_KEY is present, localStorage is the source of truth.
          const hasSavedLocally = localStorage.getItem(LS_PLACE_SAVED_KEY) === '1';
          if (!hasSavedLocally) {
            setClassPlaceState(data.location);
            try { localStorage.setItem(LS_PLACE_KEY, data.location); } catch {}
          }
        }
      } catch (err) {
        console.error('[Settings] Failed to load org settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrgSettings();
  }, [profile?.organization_id]);

  // ── Save class place ──
  // Strategy:
  //   1. Update React state immediately (optimistic UI).
  //   2. Persist to localStorage FIRST — this is guaranteed to work offline.
  //   3. Mark that the user has saved a custom place (sentinel flag).
  //   4. Then attempt to sync to Supabase — if this fails, localStorage keeps it safe.
  const saveClassPlace = useCallback(async (place: string) => {
    // 1. Optimistic UI update
    setClassPlaceState(place);

    // 2. Always persist to localStorage before touching network
    try {
      localStorage.setItem(LS_PLACE_KEY, place);
      localStorage.setItem(LS_PLACE_SAVED_KEY, '1'); // mark as user-customised
    } catch {}

    // 3. Attempt Supabase sync (requires UPDATE RLS policy on organizations)
    const orgId = profile?.organization_id;
    if (!orgId) return; // no org = nothing to sync, but localStorage is already saved

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('organizations')
      .update({ location: place })
      .eq('id', orgId);

    if (error) throw error; // bubble up so Settings page can show a toast
  }, [profile?.organization_id]);

  const setClassPlace = useCallback((place: string) => {
    setClassPlaceState(place);
    try { localStorage.setItem(LS_PLACE_KEY, place); } catch {}
  }, []);

  // ── Save theme preference ──
  const saveTheme = useCallback(async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    // Persisted via the useEffect above (sets localStorage when theme state changes)
  }, []);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        classPlace,
        setClassPlace,
        saveClassPlace,
        theme,
        setTheme,
        saveTheme,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// ==========================================
// HOOK
// ==========================================
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
