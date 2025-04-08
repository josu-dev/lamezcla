import { getContext, setContext } from 'svelte';


export function create_context<T>(key: string) {
    const _key = Symbol(key);

    function set(value: T): T {
        return setContext(_key, value);
    }

    function get(): T {
        return getContext(_key);
    }

    return {
        set: set,
        get: get
    };
}

export type UseContextArgs<T extends new (...args: any[]) => any> = ConstructorParameters<T>;
