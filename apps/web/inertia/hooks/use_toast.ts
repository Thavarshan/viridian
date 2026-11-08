'use client';

import * as React from 'react';
import type * as ToastPrimitives from '@radix-ui/react-toast';

import type { ToastActionElement, ToastProps } from '@radix-ui/react-toast';

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastPrimitives.ToastPrimitive & {
  title?: string;
  description?: string;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType['ADD_TOAST'];
      toast: ToasterToast;
    }
  | {
      type: ActionType['DISMISS_TOAST'];
      toastId?: string;
    }
  | {
      type: ActionType['REMOVE_TOAST'];
      toastId?: string;
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: 'REMOVE_TOAST',
      toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case 'DISMISS_TOAST': {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id!);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || !toastId ? { ...t, open: false } : t,
        ),
      };
    }
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, 'id'> & {
  id?: string;
};

function propsToToast(props: Toast): ToasterToast {
  const id = props.id || genId();

  return {
    ...props,
    id,
    open: true,
    onOpenChange: (open: boolean) => {
      if (!open) dispatch({ type: 'DISMISS_TOAST', toastId: id });
    },
  };
}

type ToastPropsExtended = Toast & {
  action?: ToastActionElement;
};

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const toast = ({ ...props }: ToastPropsExtended) => {
    const id = genId();

    const update = (nextProps: ToastPropsExtended) =>
      dispatch({
        type: 'ADD_TOAST',
        toast: propsToToast({ ...nextProps, id }),
      });

    const dismiss = (toastId?: string) =>
      dispatch({ type: 'DISMISS_TOAST', toastId });

    dispatch({
      type: 'ADD_TOAST',
      toast: propsToToast({ ...props, id }),
    });

    return {
      id,
      dismiss,
      update: (nextProps: ToastPropsExtended) => update(nextProps),
    };
  };

  const dismiss = (toastId?: string) => {
    dispatch({ type: 'DISMISS_TOAST', toastId });
  };

  return {
    ...state,
    toast,
    dismiss,
  };
}
