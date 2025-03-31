export function noop() { }

export function assert(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}

export function assert_exists<T>(value: T, message: string): asserts value is NonNullable<T> {
    if (value == null) {
        throw new Error(message);
    }
}
