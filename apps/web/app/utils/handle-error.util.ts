import { toast } from 'vue-sonner';

import { ApiError } from 'types';

interface ValidationErrors {
    [name: string]: string[] | string;
}

interface ErrorData {
    errors?: ValidationErrors;
}

function showErrorNotification(message: string | string[]) {
    const text = Array.isArray(message) ? message.join(' ') : message;
    if (typeof window !== 'undefined') {
        toast.error(text);
    } else {
        console.error(text);
    }
}
// vee-validate ctx.setErrors signature in Vue is (errors: Record<string, string | string[]>)
type SetFieldError = (field: string, message: string) => void

// We'll normalize to string values before passing.
type SetErrors = (errors: Record<string, string>) => void

function isSetErrors(fn: unknown): fn is SetErrors {
    return typeof fn === 'function' && (fn as (...args: unknown[]) => unknown).length < 2
}

export function handleApiError(
    e: ApiError,
    setError?: SetFieldError | SetErrors
) {
    const data = e.data as ErrorData;

    if (!data?.errors) return;

    const { global, ...errors } = data.errors;

    // Mirror my-ship-app pattern: show a global notification when present
    if (global) {
        showErrorNotification(global);
    }

    if (setError) {
        const normalized: Record<string, string> = {};

        Object.keys(errors).forEach((key) => {
            let message = errors[key];

            if (Array.isArray(message)) message = message.join(' ');
            normalized[key] = message as string;
        });

        if (isSetErrors(setError)) {
            setError(normalized);
        } else {
            Object.entries(normalized).forEach(([key, message]) => {
                setError(key, message);
            });
        }
    }
}