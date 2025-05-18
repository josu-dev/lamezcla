import type { Snippet } from 'svelte';


export type Optional<T> = undefined | T;

export type Async<T> = Promise<T>;

export type AsyncArray<T> = Promise<T[]>;

export type AsyncBoolean = Promise<void>;

export type AsyncNumber = Promise<number>;

export type AsyncOptional<T> = Promise<undefined | T>;

export type AsyncVoid = Promise<void>;

export type ElEvent<T extends HTMLElement, E extends Event> = E & { currentTarget: T; };

export type Tuple<T> = [T, ...T[]];

export type PropsNoChildren<Props extends Record<string, any> = object> = Props & {
    children?: never;
};

export type PropsWithChildren<Props extends Record<string, any> = object, ChildrenArgs extends unknown[] = []> = Props & {
    children: Snippet<ChildrenArgs>;
};
