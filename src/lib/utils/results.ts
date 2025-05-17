export type Ok<T> = {
    readonly is_ok: true,
    readonly is_err: false,
    readonly value: T;
};

export type Err<T> = {
    readonly is_ok: false,
    readonly is_err: true,
    readonly error: T;
};

export type Result<T, E> = Ok<T> | Err<E>;

export type AsyncResult<T, E> = Promise<Result<T, E>>;

export function ok(): Ok<undefined>;
export function ok<T>(value: T): Ok<T>;
export function ok<T>(value?: T): Ok<T> {
    return {
        is_ok: true,
        value: value as T,
        is_err: false,
    };
}

export function err(): Err<undefined>;
export function err<E>(error: E): Err<E>;
export function err<E>(error?: E): Err<E> {
    return {
        is_ok: false,
        is_err: true,
        error: error as E,
    };
}

export type Some<T> = {
    readonly is_some: true,
    readonly is_none: false,
    readonly value: T,
};

export type None = {
    readonly is_some: false,
    readonly is_none: true,
};

export type Option<T> = None | Some<T>;

export type AsyncOption<T> = Promise<Option<T>>;

export function some(): Some<never>;
export function some<T>(value: T): Some<T>;
export function some<T>(value?: T): Some<T> {
    return {
        is_some: true,
        is_none: false,
        value: value as T
    };
}

const _none: None = { is_some: false, is_none: true };
export function none(): None {
    return _none;
}

export function try_as_result<T>(fn: () => T): Result<T, unknown> {
    try {
        return ok(fn());
    }
    catch (ex) {
        return err(ex);
    }
}

export function try_as_option<T>(fn: () => T): Option<T> {
    try {
        return some(fn());
    }
    catch {
        return none();
    }
}
