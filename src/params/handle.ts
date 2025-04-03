import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param: string): param is string => {
    return /^@\w{3,48}$/.test(param);
}) satisfies ParamMatcher;
