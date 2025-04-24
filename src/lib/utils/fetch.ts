import type { AsyncResult } from './results.js';
import { err, ok } from './results.js';


export type FetchFn = typeof fetch;

type TryFetchOptions = {
    fetch?: FetchFn,
    url: string,
    json?: any,
    init?: RequestInit,
    parse_json?: boolean,
};

export type TryFetchError = {
    type: 'response',
    value: Response,
} | {
    type: 'exception',
    value: unknown,
} | {
    type: 'content_not_json',
    value: Error,
} | {
    type: 'invalid_json',
    value: unknown,
};

export async function try_fetch<T = unknown>({ fetch: user_fetch = fetch, url, json, init, parse_json }: TryFetchOptions): AsyncResult<T | Response, TryFetchError> {
    const is_json = json !== undefined;
    if (init === undefined) {
        init = {};
    }
    if (is_json) {
        init.method = 'post';
        init.body = JSON.stringify(json);
    }

    let r: Response;
    try {
        r = await user_fetch(url, init);
    }
    catch (ex) {
        return err({ type: "exception", value: ex });
    }

    if (!r.ok) {
        return err({ type: "response", value: r });
    }

    if (parse_json) {
        const content_type = r.headers.get('Content-Type');
        const has_json_header = content_type?.toLowerCase() === 'application/json';
        if (!has_json_header) {
            return err({ type: 'content_not_json', value: new Error(`Expected json, received '${content_type}'`) });
        }

        let out;
        try {
            out = await r.json();
        }
        catch (ex) {
            return err({ type: 'invalid_json', value: ex });
        }

        return ok<T>(out);
    }

    return ok(r);
}
