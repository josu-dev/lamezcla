import type { ParamMatcher } from '@sveltejs/kit';

const channel_handle_re = '@[A-Za-z._][0-9A-Za-z-._]{1,29}';
const ychannel_id_re = 'UC[0-9A-Za-z-_]{22}';
const lchannel_id_re = 'L[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';

const re = new RegExp(`^(?:${channel_handle_re}|${ychannel_id_re}|${lchannel_id_re})$`);

export const match = ((param: string): param is (`@${string}` | `UC${string}` | `L${string}`) => {
    return re.test(param);
}) satisfies ParamMatcher;
