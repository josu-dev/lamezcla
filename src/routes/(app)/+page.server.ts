import { get_channel_by_handle } from '$lib/youtube/index.js';
import { fail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions } from './$types.js';


const search_schema = v.object({
    query: v.pipe(v.string(), v.nonEmpty())
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

        const r = await get_channel_by_handle(form.data.query);
        if (r.is_err) {
            return fail(404, { form });
        }

        const msg = { channel: r.value };
        return message(form, msg);
    }
};
