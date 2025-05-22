import type { MaybeAsync, PropsWithChildren } from '$lib/utils/index.js';
import { create_context } from '$lib/utils/index.js';
import type { Snippet } from 'svelte';


export type ConfirmDialogRootProps = PropsWithChildren<{
    open: boolean;
}>;

export type ConfirmDialogTitleProps = PropsWithChildren<{
    class?: string;
}>;

export type ConfirmDialogDescriptionProps = PropsWithChildren<{
    class?: string;
}>;

export type ConfirmDialogActionsProps = {
    confirm: Snippet;
    actions: Snippet;
};

export type ConfirmDialogConfirmProps = PropsWithChildren<
    {
        on_confirm: () => MaybeAsync<void>;
    },
    [running: boolean]
>;

export type ConfirmDialogCancelProps = PropsWithChildren<
    {
        on_cancel?: () => MaybeAsync<void>;
    }
>;

type ConfirmDialogOptions = {
    get_open: () => boolean;
    set_open: (v: boolean) => boolean;
};

class ConfirmDialogState {
    opts: ConfirmDialogOptions;
    confirm_running = $state(false);

    constructor(opts: ConfirmDialogOptions) {
        this.opts = opts;
    }

    get_open = () => {
        return this.opts.get_open();
    };

    set_open = (v: boolean) => {
        this.opts.set_open(v);
    };

    set_confirm_running = (v: boolean) => {
        this.confirm_running = v;
    };
}

const site_sidebar_ctx = create_context<ConfirmDialogState>('confirm_dialog');

export function use_confirm_dialog_ctx(): ConfirmDialogState;
export function use_confirm_dialog_ctx(opts: ConfirmDialogOptions): ConfirmDialogState;
export function use_confirm_dialog_ctx(opts?: ConfirmDialogOptions): ConfirmDialogState {
    if (opts === undefined) {
        return site_sidebar_ctx.get();
    }

    return site_sidebar_ctx.set(new ConfirmDialogState(opts));
}
