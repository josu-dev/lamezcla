import * as localquery from '$lib/client/db/index.js';
import type * as Model from '$lib/models/index.js';
import type { Optional, VoidPromise } from '$lib/utils/index.js';
import { create_context } from '$lib/utils/index.js';


class ChannelState {
    channels: Model.Channel[] = $state([]);
    channel: Optional<Model.Channel> = $state();

    constructor(channels: Model.Channel[], channel?: Optional<Model.Channel>) {
        this.channels = channels;
        this.channel = channel;
    }

    async add(value: Model.Channel): VoidPromise {
        for (const c of this.channels) {
            if (c.id === value.id) {
                return;
            }
        }

        await localquery.insert_channel(value);
        this.channels.push(value);
        this.channels.sort((a, b) => a.title.localeCompare(b.title));
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
export function use_channel_ctx(...args: ConstructorParameters<typeof ChannelState>): ChannelState;
export function use_channel_ctx(...args: ConstructorParameters<typeof ChannelState> | []): ChannelState {
    if (args.length) {
        return channel_ctx.set(new ChannelState(...args));
    }
    return channel_ctx.get();
}
