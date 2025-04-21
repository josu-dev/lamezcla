<script lang="ts">
  import { goto } from "$app/navigation";
  import { use_pinned_ctx } from "$client/context/index.js";
  import { refresh_local_playlist_and_items } from "$client/data/refresh/index.js";
  import HumanTime from "$lib/components/HumanTime.svelte";
  import { Icon } from "$lib/components/icons/index.js";
  import type { SortMode } from "$lib/components/menus/index.js";
  import { ActionsMenu, SortMenu } from "$lib/components/menus/index.js";
  import * as PageSimple from "$lib/components/page/PageSimple/index.js";
  import SearchInput from "$lib/components/SearchInput.svelte";
  import SourceLink from "$lib/components/sources/SourceLink.svelte";
  import type * as Model from "$lib/models/index.js";
  import type { Tuple } from "$lib/utils/index.js";
  import { Searcher, seconds_to_ddhhmmss, seconds_to_human, use_async_callback, uuid } from "$lib/utils/index.js";
  import type { PageData } from "./$types.js";

  type Props = {
    data: PageData;
  };

  type SortByMode = SortMode<Model.PlaylistEntry>;

  const SORT_MODES = [
    {
      id: "manual",
      label: "Manual",
      compare_fn: (a, b) => a.item.position - b.item.position,
    },
    {
      id: "added_new",
      label: "Added newest",
      compare_fn: (a, b) => b.item.published_at.localeCompare(a.item.published_at),
    },
    {
      id: "added_old",
      label: "Added oldest",
      compare_fn: (a, b) => a.item.published_at.localeCompare(b.item.published_at),
    },
    {
      id: "channel_az",
      label: "Channel A to Z",
      compare_fn: (a, b) => a.video.channel_title.localeCompare(b.video.channel_title),
    },
    {
      id: "channel_za",
      label: "Channel Z to A",
      compare_fn: (a, b) => b.video.channel_title.localeCompare(a.video.channel_title),
    },
    {
      id: "published_new",
      label: "Published newest",
      compare_fn: (a, b) => b.video.published_at.localeCompare(a.video.published_at),
    },
    {
      id: "published_old",
      label: "Published oldest",
      compare_fn: (a, b) => a.video.published_at.localeCompare(b.video.published_at),
    },
    {
      id: "title_az",
      label: "Title A to Z",
      compare_fn: (a, b) => a.video.title.localeCompare(b.video.title),
    },
    {
      id: "title_za",
      label: "Title Z to A",
      compare_fn: (a, b) => b.video.title.localeCompare(a.video.title),
    },
    {
      id: "duration_10",
      label: "Duration longest",
      compare_fn: (a, b) => b.video.total_seconds - a.video.total_seconds,
    },
    {
      id: "duration_01",
      label: "Duration shortest",
      compare_fn: (a, b) => a.video.total_seconds - b.video.total_seconds,
    },
  ] satisfies Tuple<SortByMode>;

  const DEFAULT_SORT_MODE = SORT_MODES[0];

  const searcher = new Searcher<Model.PlaylistEntry>({
    mapper: (p) => {
      if (!p.video.is_available) {
        return "";
      }
      return p.video.title;
    },
    on_empty_search: "all",
  });

  let { data }: Props = $props();

  const pinned_state = use_pinned_ctx();

  let data_channel = $derived(data.channel);
  let data_playlist = $derived(data.playlist);
  let data_entries = $derived(data.entries);
  let playlist_is_pinned = $derived(pinned_state.is_pinned(data_playlist.id));

  let safe_entries = $derived.by(() => {
    const unavailable: Model.PlaylistEntry[] = [];
    const available: Model.PlaylistEntry[] = [];

    for (const e of data_entries) {
      if (e.video.is_available) {
        available.push(e);
      } else {
        unavailable.push(e);
      }
    }

    return {
      available,
      unavailable,
    };
  });
  let playlist_total_time = $derived.by(() => {
    let out = 0;
    for (const e of safe_entries.available) {
      out += e.video.total_seconds;
    }

    return out;
  });

  $effect(() => {
    searcher.set(safe_entries.available);
  });

  let search_query = $state("");
  let filtered_entries = $derived.by(() => {
    if (search_query === "") {
      return [...safe_entries.available];
    }

    const out = searcher.search(search_query);
    return out;
  });

  let sort_by: SortByMode = $state(DEFAULT_SORT_MODE);
  let entries = $derived.by(() => {
    const displayed = filtered_entries.toSorted(sort_by.compare_fn);

    return {
      displayed: displayed,
    };
  });

  function on_play_video(id: string) {
    goto(`/play?v=${id}`);
  }

  const refresh_playlist = use_async_callback({
    fn: refresh_local_playlist_and_items,
    on_err: (error) => {
      console.error(error);
    },
    on_ok: (value) => {
      data_playlist = value.playlist;
      data_entries = value.entries;
    },
  });
</script>

<PageSimple.Root>
  <PageSimple.Header>
    {#snippet image()}
      <PageSimple.HeaderImage img={data_playlist.img} alt="{data_playlist.title} playlist thumbnail">
        {#snippet children(image)}
          <a href="/play?l={data_playlist.id}" class="group relative">
            {@render image()}
            <div
              class="absolute grid opacity-0 [&:is(:where(.group):hover:not(:has([data-no-play]:hover))_*)]:opacity-100 transition-opacity place-items-center inset-0 bg-background/75"
            >
              <div class="flex items-center gap-2 text-lg font-bold">
                <Icon.Play class="size-5 stroke-3" /> Play
              </div>
            </div>
          </a>
        {/snippet}
      </PageSimple.HeaderImage>
    {/snippet}
    {#snippet title()}
      {data_playlist.title}
      <SourceLink type="playlist" id={data_playlist.id} title={data_playlist.title} size="size-5" />
    {/snippet}
    {#snippet children()}
      {#if data_channel}
        <div class="font-bold text-foreground text-base"><a href="/{data_channel.id}">{data_channel.title}</a></div>
      {/if}
      <div class="font-normal">
        <div>
          {safe_entries.available.length} tracks, about {seconds_to_human(playlist_total_time)}
        </div>
        <div>
          Refreshed <HumanTime utc={data_playlist.updated_at} as_relative />
        </div>
      </div>
    {/snippet}
    {#snippet actions()}
      <ActionsMenu
        actions={[
          {
            id: uuid(),
            label: "Refresh",
            action: () => {
              refresh_playlist.fn(data_playlist.id);
            },
            icon: refresh_playlist.running ? Icon.LoaderCircle : Icon.RefreshCw,
            icon_props: { class: refresh_playlist.running ? "animate-spin" : "" },
          },
          {
            id: uuid(),
            label: playlist_is_pinned ? "Unpin" : "Pin",
            action: () => {
              if (playlist_is_pinned) {
                pinned_state.unpin_by_id(data_playlist.id);
              } else {
                pinned_state.pin("playlist", data_playlist);
              }
            },
            icon: playlist_is_pinned ? Icon.PinOff : Icon.Pin,
          },
        ]}
      />{/snippet}
  </PageSimple.Header>

  <PageSimple.Content>
    {#snippet title()}
      Tracks {entries.displayed.length}
    {/snippet}
    {#snippet actions()}
      <SearchInput label="Search video" oninput={(ev) => (search_query = ev.currentTarget.value)} maxlength={32} />
      <SortMenu
        current={sort_by}
        modes={SORT_MODES}
        on_selected={(mode) => {
          sort_by = mode;
        }}
      />
    {/snippet}
    {#snippet children()}
      {#if safe_entries.unavailable.length > 0}
        <div class="px-4 pb-2">
          <p class="text-sm font-semibold text-muted">{safe_entries.unavailable.length} unavailable tracks</p>
        </div>
      {/if}
      <ul class="grid grid-cols-[repeat(1,minmax(auto,64rem))] pb-4">
        {#each entries.displayed as { item, video } (item.id)}
          {@const is_pinned = pinned_state.is_pinned(video.id)}
          <li class="flex flex-col flex-1">
            <button
              onclick={() => {
                on_play_video(video.id);
              }}
              class="group text-left flex w-full"
            >
              <div class="flex gap-4 px-4 py-2 w-full">
                <div class="relative flex-none">
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
                    <a href="/{video.channel_id}" data-no-play class="hover:text-foreground">
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
    {/snippet}
  </PageSimple.Content>
</PageSimple.Root>
