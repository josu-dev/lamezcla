export * from './asserts.js';
export * from './response.js';
export * from './results.js';

export function noop() { }

export function now_utc() {
    return new Date().toISOString();
}

export type Optional<T> = undefined | T;

export type OptionalPromise<T> = Promise<undefined | T>;

export type ArrayPromise<T> = Promise<T[]>;

export type VoidPromise = Promise<void>;
