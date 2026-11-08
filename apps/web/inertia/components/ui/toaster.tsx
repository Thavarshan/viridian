'use client';

import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';

import { useToast } from '@/hooks/use_toast';

export function Toaster(props: { className?: string }) {
  const { toasts } = useToast();

  return (
    <ToastPrimitives.Provider>
      <ToastPrimitives.Viewport className={props.className}>
        {toasts.map((toastItem) => {
          const { id, title, description, action, ...restProps } = toastItem;

          return (
            <ToastPrimitives.Root key={id} id={id} {...restProps}>
              <div className="flex items-center gap-2 pt-0.5">
                {title && (
                  <ToastPrimitives.Title>{title}</ToastPrimitives.Title>
                )}
                {description && (
                  <ToastPrimitives.Description>
                    {description}
                  </ToastPrimitives.Description>
                )}
              </div>
              {action && (
                <ToastPrimitives.Action>{action}</ToastPrimitives.Action>
              )}
              <ToastPrimitives.Close />
            </ToastPrimitives.Root>
          );
        })}
      </ToastPrimitives.Viewport>
    </ToastPrimitives.Provider>
  );
}
