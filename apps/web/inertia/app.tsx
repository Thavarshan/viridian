import './css/app.css';
import { client } from './client';
import { createRoot } from 'react-dom/client';
import { TuyauProvider } from '@adonisjs/inertia/react';
import { resolvePageComponent } from '@adonisjs/inertia/helpers';
import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react';
import { ThemeProvider } from 'next-themes';

const appName = import.meta.env.VITE_APP_NAME || 'Viridian';

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  resolve: async (name) => {
    const page = await resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob<{ default: ResolvedComponent }>('./pages/**/*.tsx'),
    );
    return page.default;
  },
  setup({ el, App, props }) {
    const initialTheme = props.initialPage.props.preferences?.theme ?? 'light';

    createRoot(el).render(
      <TuyauProvider client={client}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme={initialTheme}
          enableSystem={false}
          storageKey="app_theme"
        >
          <App {...props} />
        </ThemeProvider>
      </TuyauProvider>,
    );
  },
  progress: {
    color: '#4B5563',
  },
});
