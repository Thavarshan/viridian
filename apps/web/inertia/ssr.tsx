import { client } from '~/client';
import ReactDOMServer from 'react-dom/server';
import { TuyauProvider } from '@adonisjs/inertia/react';
import { resolvePageComponent } from '@adonisjs/inertia/helpers';
import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react';
import type { Page } from '@inertiajs/core';
import { ThemeProvider } from 'next-themes';
import type { InertiaProps } from '../app/types/inertia';

export default function render(page: Page<InertiaProps>) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: async (name) => {
      const resolvedPage = await resolvePageComponent(
        `./pages/${name}.tsx`,
        import.meta.glob<{ default: ResolvedComponent }>('./pages/**/*.tsx', {
          eager: true,
        }),
      );
      return resolvedPage.default;
    },
    setup: ({ App, props }) => {
      const initialTheme =
        props.initialPage.props.preferences?.theme ?? 'light';

      return (
        <TuyauProvider client={client}>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme={initialTheme}
            enableSystem={false}
            storageKey="app_theme"
          >
            <App {...props} />
          </ThemeProvider>
        </TuyauProvider>
      );
    },
  });
}
