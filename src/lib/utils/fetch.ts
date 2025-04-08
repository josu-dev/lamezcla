import { err, ok } from '$lib/utils/results.js';


export type FetchFn = typeof fetch;

type TryFetchOptions = {
    fetch?: FetchFn,
    url: string,
    json?: any,
    init?: RequestInit,
    parse_json?: boolean,
};

export async function try_fetch<T = unknown>({ fetch: user_fetch = fetch, url, json, init, parse_json }: TryFetchOptions) {
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
        return err(ex);
    }

    if (!r.ok) {
        return err(r);
    }

    if (parse_json) {
        const content_type = r.headers.get('Content-Type');
        const has_json_header = content_type?.toLowerCase() === 'application/json';
        if (!has_json_header) {
            return err(new Error(`Expected json, received '${content_type}'`));
        }

        let out;
        try {
            out = await r.json();
        }
        catch (ex) {
            return err(ex);
        }

        return ok<T>(out);
    }

    return ok(r);
}
