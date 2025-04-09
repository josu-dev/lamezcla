import { get_channel_by_handle } from '$lib/youtube/index.js';
import { fail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions } from './$types.js';


const profile_schema = v.object({
    handle: v.pipe(v.string(), v.regex(/^@\w{3,48}$/))
});

export async function load({ fetch }) {
    const form = await superValidate(valibot(profile_schema));

    return { form };
}

export const actions: Actions = {
    channel: async ({ request }) => {
        const form = await superValidate(request, valibot(profile_schema));
        if (!form.valid) {
            return fail(400, { form });
        }

        const r = await get_channel_by_handle(form.data.handle);
        if (r.is_err) {
            return fail(404, { form });
        }

        const msg = { channel: r.value };
        return message(form, msg);
    }
};
