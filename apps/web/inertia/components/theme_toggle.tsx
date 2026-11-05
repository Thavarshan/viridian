import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

const COOKIE = 'app_theme';
const ONE_YEAR = 60 * 60 * 24 * 365;

export default function ThemeToggle() {
  const page = usePage();
  const { setTheme, theme } = useTheme();
  const activeTheme =
    theme === 'dark' || page.props.preferences?.theme === 'dark'
      ? 'dark'
      : 'light';
  const isDark = activeTheme === 'dark';

  const toggle = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    document.cookie = `${COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-9"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
