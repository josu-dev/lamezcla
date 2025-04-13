import type { Result } from '$lib/utils/results.js';
import { untrack } from 'svelte';


export type MutableReader<T> = () => T;

type MutableUpdater<T> = (prev: T) => T;

export type MutableSetter<T> = (value: T | MutableUpdater<T>) => T;

export type Mutable<T> = {
    read: MutableReader<T>,
    set: MutableSetter<T>;
};

export function mutable<T>(value: T): Mutable<T> {
    let derived = $state(value);

    function read(): T {
        return derived;
    }

    function set(value: T | MutableUpdater<T>): T {
        derived = typeof value === 'function' ? (value as MutableUpdater<T>)(derived) : value;
        return derived;
    }

    return { read, set };
}

export function mutable_derived<T>(value: MutableReader<T>): Mutable<T> {
    let derived = $derived.by(value);

    function read(): T {
        return derived;
    }

    function set(value: T | MutableUpdater<T>): T {
        derived = typeof value === 'function' ? (value as MutableUpdater<T>)(derived) : value;
        return derived;
    }

    return { read, set };
}

export function effect_once(fn: () => (void | (() => void))): void {
    $effect(() => {
        const cleanup = untrack(fn);
        return cleanup;
    });
}

type AsyncCallback<P extends any[], T, E> = (...args: P) => Promise<Result<T, E>>;

type UseAsyncCallbackOptions<P extends any[], T, E, CB = AsyncCallback<P, T, E>> = {
    fn: CB,
    on_err: (error: E) => void,
    on_ok: (value: T) => void;
};

export function use_async_callback<P extends any[], T, E>({ fn: cb, on_err, on_ok }: UseAsyncCallbackOptions<P, T, E>) {
    let is_running = false;
    let s_running = $state(false);

    async function trigger(...args: P) {
        if (is_running) {
            return;
        }
        is_running = true;
        s_running = true;
        const r = await cb(...args);
        if (r.is_err) {
            on_err(r.error);
        }
        else {
            on_ok(r.value);
        }
        is_running = false;
        s_running = false;
    }

    return {
        get running() {
            return s_running;
        },
        fn: trigger
    };
}
