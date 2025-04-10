
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
