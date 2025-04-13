import type { Err } from '$lib/utils/results.js';
import { error, json } from '@sveltejs/kit';
import * as v from 'valibot';


export async function parse_json<T extends v.GenericSchema>(schema: T, request: Request): Promise<v.SafeParseResult<T>> {
    let json;
    try {
        json = await request.json();
    }
    catch (ex) {
        return {
            typed: false,
            success: false,
            issues: [] as any,
            output: ex
        };
    }
    return v.safeParse(schema, json);
}

export function response_json(status: number, data: any): Response {
    return json(data, { status: status });
}

export function response_error(status: number, data: any = undefined): Response {
    if (data === undefined) {
        return new Response(null, { status: status });
    }

    return json(data, { status: status });
}

export function throw_as_500(e: Err<unknown>, msg?: string): never {
    error(e.error instanceof Response ? e.error.status : 500, msg);
}
