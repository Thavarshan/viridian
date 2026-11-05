import { type ReactNode } from 'react';
import { Head } from '@inertiajs/react';

/**
 * Shared app page frame with a document title, heading, description, and
 * optional actions.
 */
export default function Page({
  title,
  hideTitle = false,
  description,
  actions,
  children,
}: {
  title: string;
  hideTitle?: boolean;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  const hasHeader = !hideTitle || description || actions;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <Head title={title} />
      {hasHeader && (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {!hideTitle && (
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            )}
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          )}
        </header>
      )}
      {children}
    </div>
  );
}
