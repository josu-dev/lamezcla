import { youtube } from '$data/providers/youtube/server/index.js';
import { fail } from '@sveltejs/kit';
import { message, superValidate, } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types.js';
import { parse_query } from './shared.js';


const search_schema = v.object({
    query: v.pipe(v.string(), v.minLength(2), v.maxLength(128))
});

export const load: PageServerLoad = async () => {
    const form = await superValidate(valibot(search_schema));

    return { form };
};

export const actions: Actions = {
    search: async ({ request }) => {
        const form = await superValidate(request, valibot(search_schema));
        if (!form.valid) {
            return fail(400, { form });
        }

        const query = parse_query(form.data.query);
        let status: number = 200;
        let redirect_to: string = '';
        if (query.mode === '') {
            status = 400;
        }
        else if (query.mode === 'pl') {
            const r = await youtube.get_playlists([query.value]);
            if (r.is_err) {
                status = r.error.status;
            }
            else if (r.value.length === 0) {
                status = 404;
            }
            else {
                redirect_to = `/playlist/${r.value[0].id}`;
            }
        }
        else if (query.mode === 'c' || query.mode === 'ch') {
            const r = await (query.mode === 'c' ? youtube.get_channel : youtube.get_channel_by_handle)(query.value);
            if (r.is_err) {
                status = r.error.status;
            }
            else if (r.value === undefined) {
                status = 404;
            }
            else {
                redirect_to = `/${r.value.id}`;
            }
        }
        else {
            const r = await youtube.get_videos([query.value]);
            if (r.is_err) {
                status = r.error.status;
            }
            else if (r.value.length === 0) {
                status = 404;
            }
            else {
                redirect_to = `/video/${r.value[0].id}`;
            }
        }

        if (status !== 200) {
            return message(
                form,
                {
                    query: query,
                    is_redirect: false,
                    is_error: true,
                    error: "Something happend, try again later",
                    status: status,
                },
                { status: status as any }
            );
        }

        return message(
            form,
            {
                query: query,
                is_redirect: true,
                is_error: false,
                redirect_to: redirect_to
            }
        );
    }
};
