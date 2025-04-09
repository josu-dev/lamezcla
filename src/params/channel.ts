import type { ParamMatcher } from '@sveltejs/kit';

const channel_handle_re = 'UC[A-Za-z0-9_-]{22}';
const channel_id_re = '@[A-Za-z0-9_.-]{4,30}';

const re = new RegExp('^(?:' + channel_handle_re + '|' + channel_id_re + ')$');

export const match = ((param: string): param is (`@${string}` | `UC${string}`) => {
    return re.test(param);
}) satisfies ParamMatcher;
