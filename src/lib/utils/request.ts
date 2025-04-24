import { error, json } from '@sveltejs/kit';
import * as v from 'valibot';


export function endpoint_json(status: number, data: any): Response {
    return json(data, { status: status });
}

export function endpoint_error(status: number, data: any = undefined): Response {
    if (data === undefined) {
        return new Response(null, { status: status });
    }

    return json(data, { status: status });
}

export async function parse_request<T extends v.GenericSchema>(schema: T, request: Request): Promise<v.SafeParseResult<T>> {
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

export function throw_http_error(e: unknown, msg?: string): never {
    const status = typeof e === 'number' ? e : e instanceof Response ? e.status : 500;
    error(status, msg);
}
