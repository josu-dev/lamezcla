<script lang="ts">
  import { goto } from "$app/navigation";
  import { add_playlist_subset } from "$data/local/db/playlists.js";
  import { refresh_local_playlist_and_items } from "$data/local/db/refresh.js";
  import type { Model } from "$data/models/index.js";
  import HumanTime from "$lib/components/HumanTime.svelte";
  import { Icon } from "$lib/components/icons/index.js";
  import { OptionsMenu, SortMenu } from "$lib/components/menus/index.js";
  import SearchInput from "$lib/components/SearchInput.svelte";
  import { Metadata, PageSimple } from "$lib/components/site/index.js";
  import SourceLink from "$lib/components/sources/SourceLink.svelte";
  import { use_pinned_ctx } from "$lib/context/index.js";
  import type { Tuple } from "$lib/utils/index.js";
  import {
    is_play_prevented,
    Searcher,
    seconds_to_hhmmss,
    seconds_to_human,
    use_async_callback,
  } from "$lib/utils/index.js";
  import type { PageData } from "./$types.js";

  type Props = {
    data: PageData;
  };

  type SortByMode = SortMenu.SortMode<Model.PlaylistEntry>;

  const SORT_MODES = [
    {
      id: "manual",
      label: "Manual",
      compare_fn: (a, b) => a.item.position - b.item.position,
    },
    {
      id: "added_new",
      label: "Added newest",
      compare_fn: (a, b) => b.item.created_at.localeCompare(a.item.created_at),
    },
    {
      id: "added_old",
      label: "Added oldest",
      compare_fn: (a, b) => a.item.created_at.localeCompare(b.item.created_at),
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
      compare_fn: (a, b) => b.video.created_at.localeCompare(a.video.created_at),
    },
    {
      id: "published_old",
      label: "Published oldest",
      compare_fn: (a, b) => a.video.created_at.localeCompare(b.video.created_at),
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
      compare_fn: (a, b) => b.video.duration_s - a.video.duration_s,
    },
    {
      id: "duration_01",
      label: "Duration shortest",
      compare_fn: (a, b) => a.video.duration_s - b.video.duration_s,
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

  const data_channel = $derived(data.channel);
  let data_playlist = $derived(data.playlist);
  let data_entries = $derived(data.entries);
  const playlist_is_pinned = $derived(pinned_state.is_pinned(data_playlist.id));

  const entries_cache = $derived.by(() => {
    const all: Model.PlaylistEntry[] = new Array(data_entries.length);
    const available: Model.PlaylistEntry[] = [];
    const unavailable: Model.PlaylistEntry[] = [];
    let available_total_time = 0;

    for (let i = 0; i < data_entries.length; i++) {
      const e = data_entries[i];
      all[i] = e;
      if (e.item.is_available) {
        available.push(e);
        available_total_time += e.video.duration_s;
      } else {
        unavailable.push(e);
      }
    }

    return {
      all: all,
      available,
      available_total_time,
      unavailable,
    };
  });

  let some_track_unavailable = $derived(entries_cache.unavailable.length > 0);
  let show_unavailable = $state(false);
  const playlist_total_time = $derived(entries_cache.available_total_time);

  const base_entries = $derived(show_unavailable ? entries_cache.all : entries_cache.available);

  $effect(() => {
    searcher.set(base_entries);
  });

  let search_query = $state("");
  const entries_filtered = $derived.by(() => {
    if (search_query === "") {
      return base_entries;
    }

    const out = searcher.search(search_query);
    return out;
  });

  let sort_by: SortByMode = $state(DEFAULT_SORT_MODE);
  let entries_displayed = $derived.by(() => {
    const out = entries_filtered.toSorted(sort_by.compare_fn);
    return out;
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

  const is_playlist_subset_playable = $derived(
    (entries_displayed.length > 0 && entries_displayed.length < entries_cache.available.length) ||
      sort_by.id !== DEFAULT_SORT_MODE.id,
  );
  async function play_current_playlist() {
    const playlist = await add_playlist_subset($state.snapshot(data_playlist), $state.snapshot(entries_displayed));

    goto(`/play?l=${playlist.id}`);
  }
</script>

<Metadata description="Just have a look at the vibes of '{data_playlist.title}' tracks." />

<PageSimple.Root>
  <PageSimple.Header>
    {#snippet image()}
      <PageSimple.HeaderImage img={data_playlist.img} alt="{data_playlist.title} playlist thumbnail">
        {#snippet children(image)}
          <a href="/play?l={data_playlist.id}" class="group relative">
            {@render image()}
            <div
              class="absolute grid opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity place-items-center inset-0 bg-background/75"
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
          Created <HumanTime utc={data_channel.created_at} as_relative />
        </div>
        <div>
          {entries_cache.all.length} tracks,
          {#if some_track_unavailable}
            {entries_cache.available.length} available,
          {/if}
          about {seconds_to_human(playlist_total_time)}
        </div>
        <!-- <div>
          Last refresh <HumanTime utc={data_playlist.updated_at} as_relative />
        </div> -->
      </div>
    {/snippet}
    {#snippet actions()}
      <OptionsMenu.Root
        label="Playlist options"
        options={[
          {
            label: "Refresh",
            onSelect: () => {
              refresh_playlist.fn(data_playlist.id);
            },
            icon_left: {
              Icon: refresh_playlist.running ? Icon.LoaderCircle : Icon.RefreshCw,
              props: { class: refresh_playlist.running ? "animate-spin" : "" },
            },
          },
          {
            label: playlist_is_pinned ? "Unpin" : "Pin",
            onSelect: () => {
              if (playlist_is_pinned) {
                pinned_state.unpin_by_id(data_playlist.id);
              } else {
                if (data_playlist.tag === "l") {
                  pinned_state.pin("lplaylist", data_playlist);
                } else {
                  pinned_state.pin("yplaylist", data_playlist);
                }
              }
            },
            icon_left: { Icon: playlist_is_pinned ? Icon.PinOff : Icon.Pin },
          },
        ]}
      />
    {/snippet}
  </PageSimple.Header>

  <PageSimple.Content>
    {#snippet title()}
      <span class="inline-block">
        Tracks {entries_displayed.length}
      </span>
      {#if is_playlist_subset_playable}
        <button
          onclick={play_current_playlist}
          class="ml-auto font-normal hover:bg-accent rounded-md inline-flex align-bottom gap-x-1.5 py-0.5 pl-1 pr-1.5 text-base active:scale-[0.98]"
        >
          <Icon.Play /><span class="">Subset</span>
        </button>
      {/if}
    {/snippet}
    {#snippet actions()}
      <SearchInput label="Search video" oninput={(ev) => (search_query = ev.currentTarget.value)} maxlength={32} />
      <SortMenu.Root
        current={sort_by}
        modes={SORT_MODES}
        on_selected={(mode) => {
          sort_by = mode;
        }}
      />
      {#if some_track_unavailable}
        {@const title = show_unavailable ? "Hide unavailable tracks" : "Show unavailable tracks"}
        <button
          {title}
          onclick={() => (show_unavailable = !show_unavailable)}
          class="hover:bg-accent focus-outline rounded-md inline-flex gap-x-2 py-0.5 px-1.5"
        >
          <span class="sr-only">{title}</span>
          {#if show_unavailable}
            <Icon.EyeOff />
          {:else}
            <Icon.Eye />
          {/if}
        </button>
      {/if}
    {/snippet}
    {#snippet children()}
      <ul class="grid grid-cols-[repeat(1,minmax(auto,64rem))] gap-y-8 sm:gap-y-0">
        {#each entries_displayed as { item, video } (item.id)}
          <li class="flex flex-col flex-1">
            {#if item.is_available}
              {@const is_pinned = pinned_state.is_pinned(video.id)}
              <button
                onclick={(e) => {
                  if (is_play_prevented(e)) {
                    return;
                  }
                  on_play_video(video.id);
                }}
                class="group text-left flex w-full"
              >
                <div class="flex flex-col gap-4 px-4 py-2 w-full sm:flex-row">
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
                        {seconds_to_hhmmss(video.duration_s)}
                      </span>
                    </div>
                  </div>
                  <div class="flex gap-4 flex-1">
                    <div>
                      <div class="flex">
                        <h3 class="text-lg font-semibold mt-2">{video.title}</h3>
                      </div>
                      <p class="mt-1 text-sm font-semibold text-muted">
                        <a
                          href="/{video.channel_id}"
                          data-no-play
                          class="focus-outline ronded-xs hover:text-foreground"
                        >
                          {video.channel_title}
                        </a>
                        -
                        <span><HumanTime as_relative utc={video.created_at} /></span>
                      </p>
                    </div>
                    <div class="flex items-center ml-auto" data-no-play>
                      <OptionsMenu.Root
                        label="Video options"
                        options={[
                          {
                            label: "Pin",
                            onSelect: () => {
                              if (is_pinned) {
                                pinned_state.unpin_by_id(video.id);
                              } else {
                                pinned_state.pin("video", video);
                              }
                            },
                            icon_left: { Icon: is_pinned ? Icon.PinOff : Icon.Pin },
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </button>
            {:else}
              <div class="flex gap-4 px-4 py-2 w-full">
                <div class="relative flex-none">
                  <img
                    src={video.img?.url}
                    width={video.img?.width}
                    height={video.img?.height}
                    alt="{video.title} video thumbnail"
                    class="rounded-md w-[320px] aspect-video object-fill"
                  />
                </div>
                <div>
                  <div class="flex">
                    <h3 class="text-lg font-semibold mt-2">
                      {#if item.is_deleted}
                        Deleted track
                      {:else if item.is_private}
                        Privated track
                      {:else}
                        Unavailable track
                      {/if}
                    </h3>
                  </div>
                </div>
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    {/snippet}
  </PageSimple.Content>
</PageSimple.Root>
