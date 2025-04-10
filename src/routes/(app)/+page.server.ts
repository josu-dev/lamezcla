import { get_channel, get_channel_by_handle, get_playlists, get_videos } from '$lib/youtube/index.js';
import { fail } from '@sveltejs/kit';
import type { ErrorStatus } from 'sveltekit-superforms';
import { message, superValidate, } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions } from './$types.js';
import { parse_query } from './shared.js';


const search_schema = v.object({
    query: v.pipe(v.string(), v.minLength(2), v.maxLength(128))
});

export async function load({ fetch }) {
    const form = await superValidate(valibot(search_schema));

    return { form };
}

export const actions: Actions = {
    search: async ({ request }) => {
        const form = await superValidate(request, valibot(search_schema));
        if (!form.valid) {
            return fail(400, { form });
        }

        const query = parse_query(form.data.query);
        let status: undefined | ErrorStatus;
        let redirect_to: string = '';
        switch (query.mode) {
            case '': {
                status = 400;
                break;
            }
            case 'c': {
                const r = await get_channel(query.value);
                if (r.is_err) {
                    console.warn(r);
                    status = 400;
                }
                else {
                    redirect_to = `/${r.value.id}`;
                }
                break;
            }
            case 'ch': {
                const r = await get_channel_by_handle(query.value);
                if (r.is_err) {
                    console.warn(r);
                    status = 400;
                    break;
                }
                redirect_to = `/${r.value.handle}`;
                break;
            }
            case 'pl': {
                const r = await get_playlists([query.value]);
                if (r.is_err) {
                    console.warn(r);
                    status = 400;
                    break;
                }
                if (r.value.length === 0) {
                    status = 404;
                    break;
                }
                const p = r.value[0];
                redirect_to = `/playlist/${p.id}`;
                break;
            }

            case 'v': {
                const r = await get_videos([query.value]);
                if (r.is_err) {
                    console.warn(r);
                    status = 400;
                    break;
                }
                if (r.value.length === 0) {
                    status = 404;
                    break;
                }
                const v = r.value[0];
                redirect_to = `/video/${v.id}`;
                break;
            }
        }

        let msg: any;
        if (status === undefined) {
            msg = {
                query: query,
                is_redirect: true,
                is_error: false,
                redirect_to: redirect_to
            };
        }
        else {
            msg = {
                query: query,
                is_redirect: false,
                is_error: true,
                error: "some error happend"
            };
        }
        return message(form, msg, { status: status });
    }
};
