import type { Snippet } from 'svelte';


export type Optional<T> = undefined | T;

export type OptionalPromise<T> = Promise<undefined | T>;

export type ArrayPromise<T> = Promise<T[]>;

export type VoidPromise = Promise<void>;

export type ElEvent<E extends Event, T extends HTMLElement> = E & { currentTarget: T; };

export type Tuple<T> = [T, ...T[]];

export type PropsNoChildren<Props extends Record<string, any> = object> = Props & {
    children?: never;
};

export type PropsWithChildren<Props extends Record<string, any> = object> = Props & {
    children: Snippet;
};
