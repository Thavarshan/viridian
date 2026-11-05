import { type ReactNode } from 'react';

/** A titled group of related page content. */
export default function Section({
  title,
  description,
  children,
}: {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 border-t pt-6 first:border-t-0 first:pt-0">
      {(title || description) && (
        <header className="space-y-1">
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </header>
      )}
      <div className="space-y-5">{children}</div>
    </section>
  );
}
