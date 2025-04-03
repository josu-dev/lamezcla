import { browser } from '$app/environment';
import { noop } from '$lib/utils/index.js';
import { on } from 'svelte/events';
import { createSubscriber } from 'svelte/reactivity';

const default_window = browser && typeof window !== "undefined" ? window : undefined;

type PersistedStateOptions<T> = {
    key: string,
    initial: T,
    sync?: boolean,
};

function deserialize(value: string) {
    try {
        return JSON.parse(value);
    }
    catch {
        return undefined;
    }
}
function serialize(value: unknown) {
    try {
        return JSON.stringify(value);
    }
    catch {
        return '';
    }
}

function set_key(key: string, value: unknown) {
    localStorage.setItem(key, serialize(value));
}

export function getPersistedState<T>(options: PersistedStateOptions<T>) {
    const {
        key,
        initial: initial_value,
        sync = true
    } = options;
    let _value = $state(initial_value);
    if (default_window === undefined) {
        return {
            current: initial_value,
        };
    }

    const stored_value = localStorage.getItem(key);
    if (stored_value != null) {
        _value = deserialize(stored_value);
    }
    else {
        set_key(key, initial_value);
    }

    let subscribe = noop;
    if (sync) {
        subscribe = createSubscriber(() => on(default_window, 'storage', (ev) => {
            if (ev.key !== key || ev.newValue == null) {
                return;
            }
            console.log(ev);
            _value = deserialize(ev.newValue);
        }));
    }

    return {
        get current() {
            subscribe();
            return _value;
        },
        set current(value) {
            set_key(key, value);
            _value = value;
        }
    };

}
