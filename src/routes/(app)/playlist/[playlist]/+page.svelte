<script lang="ts">
  import { use_pinned_ctx } from "$lib/client/state/pinned.svelte.js";
  import ActionsMenu from "$lib/components/ActionsMenu/ActionsMenu.svelte";
  import HumanTime from "$lib/components/HumanTime.svelte";
  import * as Icon from "$lib/components/icons.js";
  import PageSimple from "$lib/components/PageSimple.svelte";
  import * as Model from "$lib/models/index.js";
  import { seconds_to_ddhhmmss } from "$lib/player/utils.js";
  import { uuid } from "$lib/utils/index.js";
  import type { PageData } from "./$types.js";

  type Props = {
    data: PageData;
  };

  let { data }: Props = $props();
  let playlist = $derived(data.playlist);

  const pinned_state = use_pinned_ctx();

  let entries = $derived.by(() => {
    const unavailable: Model.PlaylistEntry[] = [];
    const displayed: Model.PlaylistEntry[] = [];

    for (const e of data.entries) {
      if (e.video.is_available) {
        displayed.push(e);
      } else {
        unavailable.push(e);
      }
    }

    return {
      displayed,
      unavailable,
    };
  });
</script>

<PageSimple
  header={{
    img: playlist.img,
    title: playlist.title,
    updated_at: playlist.updated_at,
  }}
  content={{
    title: "Track" + (entries.displayed.length === 0 ? "" : "s"),
    item_count: entries.displayed.length,
  }}
>
  {#if entries.unavailable.length > 0}
    <div class="px-4 pb-2">
      <p class="text-sm font-semibold text-muted">{entries.unavailable.length} unavailable tracks</p>
    </div>
  {/if}
  <ul class="grid grid-cols-[repeat(1,minmax(auto,64rem))] pb-4">
    {#each entries.displayed as { item, video } (item.id)}
      {@const is_pinned = pinned_state.is_pinned(video.id)}
      <li class="flex flex-col flex-1">
        <button class="group text-left flex w-full">
          <div class="flex gap-4 px-4 py-2 w-full">
            <div class="relative">
              <img
                src={video.img?.url}
                width={video.img?.width}
                height={video.img?.height}
                alt="{video.title} video thumbnail"
                class="rounded-md w-full aspect-video object-fill"
              />
              <div
                class="absolute grid opacity-0 [&:is(:where(.group):hover:not(:has([data-no-play]:hover))_*)]:opacity-100 transition-opacity place-items-center inset-0 bg-background/75"
              >
                <div class="flex items-center gap-2 text-2xl font-bold">
                  <Icon.Play class="size-8 stroke-3" /> Play
                </div>
              </div>
              <div class="absolute bottom-2 right-2">
                <span class="bg-accent px-1.5 py-1 rounded-md text-xs font-semibold tracking-wider">
                  {seconds_to_ddhhmmss(video.total_seconds)}
                </span>
              </div>
            </div>
            <div>
              <div class="flex">
                <h3 class="text-lg font-semibold mt-2">{video.title}</h3>
              </div>
              <p class="mt-1 text-sm font-semibold text-muted">
                <a href="/{video.id}" data-no-play class="hover:text-foreground">
                  {video.channel_title}
                </a>
                -
                <span><HumanTime as_relative utc={video.published_at} /></span>
              </p>
            </div>
            <div class="flex items-center ml-auto" data-no-play>
              <ActionsMenu
                actions={[
                  {
                    id: uuid(),
                    label: "Pin",
                    action: () => {
                      if (is_pinned) {
                        pinned_state.unpin_by_id(video.id);
                      } else {
                        pinned_state.pin("video", video);
                      }
                    },
                    icon: is_pinned ? Icon.PinOff : Icon.Pin,
                  },
                ]}
              />
            </div>
          </div>
        </button>
      </li>
    {/each}
  </ul>
</PageSimple>
