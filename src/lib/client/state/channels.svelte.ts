import * as localquery from '$lib/client/db/index.js';
import type * as Model from '$lib/models/index.js';
import type { Optional } from '$lib/utils/index.js';
import { create_context, type UseContextArgs } from './shared.js';


class ChannelState {
    channels: Model.Channel[] = $state([]);
    channel: Optional<Model.Channel> = $state();

    constructor(channels: Model.Channel[], channel?: Optional<Model.Channel>) {
        this.channels = channels;
        this.channel = channel;
    }

    async sync() {
        const cs = await localquery.select_channels();
        this.channels = cs;
        for (const c of cs) {
            if (c.id === this.channel?.id) {
                this.channel = c;
                continue;
            }
        }
    }
}

const channel_ctx = create_context<ChannelState>('channel');

export function use_channel_ctx(): ChannelState;
export function use_channel_ctx(...args: UseContextArgs<typeof ChannelState>): ChannelState;
export function use_channel_ctx(...args: UseContextArgs<typeof ChannelState> | []): ChannelState {
    if (args.length) {
        return channel_ctx.set(new ChannelState(...args));
    }
    return channel_ctx.get();
}
