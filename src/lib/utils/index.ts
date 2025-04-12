export * from './asserts.js';
export * from './context.js';
export * from './fetch.js';
export * from './response.js';
export * from './results.js';
export * from './state.svelte.js';

export function noop() { }

export function now_utc() {
    return new Date().toISOString();
}

export function uuid() {
    return crypto.randomUUID();
}

export type Optional<T> = undefined | T;

export type OptionalPromise<T> = Promise<undefined | T>;

export type ArrayPromise<T> = Promise<T[]>;

export type VoidPromise = Promise<void>;

export type ElEvent<E extends Event, T extends HTMLElement> = E & { currentTarget: T; };

export type Tuple<T> = [T, ...T[]];
