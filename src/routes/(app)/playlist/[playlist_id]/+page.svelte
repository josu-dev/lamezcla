<script lang="ts">
  import { goto } from "$app/navigation";
  import { db } from "$data/local/db/index.js";
  import { extract_videos, normalize_playlist_entries, SYNCHRONIZATION_ACTION } from "$data/local/shared.js";
  import type { Model } from "$data/models/index.js";
  import { youtube } from "$data/providers/youtube/client/index.js";
  import { playlist_url, video_url } from "$data/providers/youtube/shared.js";
  import { ConfirmDialog } from "$lib/components/dialogs/index.js";
  import HumanTime from "$lib/components/HumanTime.svelte";
  import { Icon } from "$lib/components/icons/index.js";
  import { OptionsMenu, PlaylistsMenu, SortMenu } from "$lib/components/menus/index.js";
  import PlayCover from "$lib/components/PlayCover.svelte";
  import SearchInput from "$lib/components/SearchInput.svelte";
  import { Metadata, PageSimple } from "$lib/components/site/index.js";
  import { toast } from "$lib/components/Toaster.svelte";
  import { SITE_NAME } from "$lib/constants.js";
  import { use_pinned_ctx, use_playlists_ctx } from "$lib/context/index.js";
  import {
    is_play_prevented,
    Searcher,
    seconds_to_hhmmss,
    seconds_to_human,
    share_or_copy_link,
    use_async_callback,
  } from "$lib/utils/index.js";
  import { createVirtualizer } from "@tanstack/svelte-virtual";
  import type { PageData } from "./$types.js";
  import { DEFAULT_SORT_MODE, SORT_MODES, type SortByMode } from "./config.js";

  type Props = {
    data: PageData;
  };

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
  // Fallback to empty array because on onmount breaks
  let data_entries = $derived(data.entries ?? []);
  const playlist_is_pinned = $derived(pinned_state.is_pinned(data_playlist.id));
  const pending_entries = $state(
    data.entries_sync_action.tag === "NONE"
      ? {
          loading: false,
          curr_count: 0,
          total_entries: 0,
        }
      : {
          loading: data.entries_sync_action.tag === "RESUME",
          curr_count: data.entries.length,
          total_entries: data.entries_sync_action.total_count ?? data.entries.length,
        }
  );

  async function fetch_and_store_entries(id: string, page_token: undefined | string, reset: boolean = false) {
    const items: Array<Model.PlaylistItemCompact> = [];
    const videos_compact_available: Array<Model.VideoCompact> = [];
    const video_id_to_video: Map<string, Model.Video> = new Map();
    let curr_page: undefined | string = page_token;
    while (true) {
      const r = await youtube.get_playlist_entries(id, curr_page, fetch);
      if (r.is_err) {
        pending_entries.loading = false;
        // TODO: error message(?
        return;
      }

      curr_page = r.value.next_page;
      items.push(...r.value.items);
      extract_videos(r.value.videos, videos_compact_available, [], video_id_to_video);
      pending_entries.curr_count += r.value.items.length;

      if (curr_page == undefined) {
        break;
      }
    }

    await Promise.all([db.upsert_playlists_items(items), db.upsert_videos(videos_compact_available)]);

    const entries = normalize_playlist_entries(items, video_id_to_video);
    if (reset) {
      data_entries = entries;
    } else {
      data_entries = [...data_entries, ...entries];
    }
    pending_entries.loading = false;
  }

  async function hard_refresh_entries(id: string) {
    await db.delete_playlist_items_by_playlist_id(id);
    await fetch_and_store_entries(id, void 0, true);
  }

  $effect(() => {
    if (data.entries_sync_action.tag === SYNCHRONIZATION_ACTION.NONE) {
      return;
    }
    if (data.entries_sync_action.tag === SYNCHRONIZATION_ACTION.HARD_REFRESH) {
      hard_refresh_entries(data.playlist.id);
      return;
    }
    if (data.entries_sync_action.tag === SYNCHRONIZATION_ACTION.RESUME) {
      fetch_and_store_entries(data.playlist.id, data.entries_sync_action.next_page);
    }
  });

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
  let show_unavailable = $state(true);
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

    const out = searcher.search_exact(search_query);
    return out;
  });

  let sort_by: SortByMode = $state(DEFAULT_SORT_MODE);
  let entries_displayed = $derived.by(() => {
    const out = entries_filtered.toSorted(sort_by.compare_fn);
    return out;
  });

  let vl_scroll_container = $state<HTMLElement | null>(null);
  let vl_elements: HTMLLIElement[] = $state([]);
  let virtualizer = $derived(
    createVirtualizer<HTMLElement, HTMLLIElement>({
      count: entries_displayed.length,
      getScrollElement: vl_scroll_container ? () => vl_scroll_container : () => null,
      estimateSize: () => 196,
    })
  );
  let vl_items = $derived($virtualizer.getVirtualItems());
  // Ref: https://github.com/TanStack/virtual/issues/640#issuecomment-1885029911
  // Ref: https://github.com/TanStack/virtual/discussions/476#discussioncomment-4724139
  let [vl_items_before, vl_items_after] = $derived(
    vl_items.length > 0
      ? [
          vl_items[0].start - $virtualizer.options.scrollMargin,
          $virtualizer.getTotalSize() - vl_items[vl_items.length - 1].end,
        ]
      : [0, 0]
  );

  $effect(() => {
    if (vl_elements.length) {
      vl_elements.forEach((el) => $virtualizer.measureElement(el));
    }
  });

  function on_play_video(id: string) {
    goto(`/play?v=${id}`);
  }

  async function on_shuffle() {
    const entries = $state.snapshot(entries_displayed);
    entries.sort(() => Math.random() - 0.5);
    const playlist = await db.add_playlist_subset_from_entries($state.snapshot(data_playlist), entries);
    goto(`/play?l=${playlist.id}`);
  }

  const refresh_playlist = use_async_callback({
    fn: db.refresh_local_playlist_and_items,
    on_err: (error) => {
      console.error(error);
    },
    on_ok: (value) => {
      data_playlist = value.playlist;
      data_entries = value.entries;
    },
  });

  const is_playlist_subset_playable = $derived(
    (entries_displayed.length > 0 &&
      entries_displayed.length < (show_unavailable ? entries_cache.all.length : entries_cache.available.length)) ||
      sort_by.id !== DEFAULT_SORT_MODE.id
  );
  async function play_current_playlist() {
    const playlist = await db.add_playlist_subset_from_entries(
      $state.snapshot(data_playlist),
      $state.snapshot(entries_displayed)
    );

    goto(`/play?l=${playlist.id}`);
  }

  let playlists_menu: PlaylistsMenu.Root;

  const playlists = use_playlists_ctx();

  async function on_delete_playlist() {
    const deleted = await playlists.delete_playlist(data_playlist.id);
    if (!deleted) {
      return;
    }
    if (playlist_is_pinned) {
      await pinned_state.unpin_by_id(data_playlist.id);
    }
    goto("/");
  }

  let delete_dialog_open = $state(false);

  function open_delete_dialog() {
    delete_dialog_open = true;
  }
</script>

<Metadata description="Just have a look at the vibes of '{data_playlist.title}' tracks." />

<PlaylistsMenu.Root bind:this={playlists_menu} />

<ConfirmDialog.Root bind:open={delete_dialog_open}>
  <ConfirmDialog.Title>Playlist deletion</ConfirmDialog.Title>
  <ConfirmDialog.Description>
    Deleting the playlist will <b>permanently remove</b> all the tracks it has.. This action will also
    <b>erase all information</b> generated while you've been playing the playlist.
  </ConfirmDialog.Description>
  <ConfirmDialog.Actions>
    {#snippet confirm()}
      Are you sure you want to delete the playlist '{data_playlist.title}'?
    {/snippet}
    {#snippet actions()}
      <ConfirmDialog.Confirm on_confirm={on_delete_playlist}>
        {#snippet children(running)}
          {#if running}
            <Icon.LoaderCircle class="animate-spin" />
            <span>Deleting</span>
          {:else}
            <Icon.Shredder />
            <span>Delete</span>
          {/if}
        {/snippet}
      </ConfirmDialog.Confirm>
      <ConfirmDialog.Cancel>
        <Icon.X />
        <span>Cancel</span>
      </ConfirmDialog.Cancel>
    {/snippet}
  </ConfirmDialog.Actions>
</ConfirmDialog.Root>

<PageSimple.Root bind:el={vl_scroll_container}>
  <PageSimple.Header>
    {#snippet image()}
      <PageSimple.HeaderImage img={data_playlist.img} alt="{data_playlist.title} playlist thumbnail">
        {#snippet children(image)}
          <a href="/play?l={data_playlist.id}" class="group relative block h-28 aspect-video">
            {@render image()}
            <PlayCover />
          </a>
        {/snippet}
      </PageSimple.HeaderImage>
    {/snippet}
    {#snippet title()}
      {data_playlist.title}
    {/snippet}
    {#snippet children()}
      {#if data_channel}
        <div class="font-bold text-foreground text-base">
          {#if data_channel.handle === undefined}
            <a href="/{data_channel.id}">{data_channel.title}</a>
          {:else}
            <a href="/{data_channel.handle}">{data_channel.handle}</a>
          {/if}
        </div>
      {/if}
      <div class="font-normal">
        {#if data.parent_playlist !== undefined}
          <div>
            Subplaylist of <a href="/playlist/{data.parent_playlist.id}" class="font-bold hover:text-foreground"
              >{data.parent_playlist.title}</a
            >
          </div>
        {/if}
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
      </div>
    {/snippet}
    {#snippet actions()}
      <OptionsMenu.Root
        label="Playlist options"
        options={[
          {
            label: "Shuffle",
            onSelect: on_shuffle,
            icon_left: { Icon: Icon.Shuffle },
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
            disabled: data_playlist.tag === "l" && !data_playlist.pinneable,
          },
          {
            label: "Share",
            onSelect: () => {
              share_or_copy_link(
                {
                  title: SITE_NAME,
                  text: `Shuffle "${data_playlist.title}" playlist on ${SITE_NAME}`,
                  url: window.location.href,
                },
                {
                  on_copy_ok: () => toast.success("Playlist link copied to clipboard"),
                  on_copy_err: () => toast.error("Failed to copy playlist link to clipboard"),
                }
              );
            },
            icon_left: { Icon: Icon.Share2 },
            disabled: data_playlist.tag === "l",
          },
          {
            label: "Refresh",
            onSelect: () => {
              refresh_playlist.fn(data_playlist.id);
            },
            icon_left: {
              Icon: refresh_playlist.running ? Icon.LoaderCircle : Icon.RefreshCw,
              props: { class: refresh_playlist.running ? "animate-spin" : "" },
            },
            disabled: data_playlist.tag === "l",
          },
          {
            label: "Delete",
            onSelect: open_delete_dialog,
            icon_left: { Icon: Icon.Shredder },
            disabled: data_playlist.tag === "y" || data_playlist.system,
          },
          {
            label: "Open in YouTube",
            href: playlist_url(data_playlist.id),
            icon_left: { Icon: Icon.SquareArrowOutUpRight },
            disabled: data_playlist.tag === "l",
          },
        ]}
      />
    {/snippet}
  </PageSimple.Header>

  <PageSimple.Content>
    {#snippet title()}
      {#if pending_entries.loading}
        <span class="inline-flex gap-2">
          Tracks {pending_entries.curr_count} / {pending_entries.total_entries}
          <Icon.LoaderCircle class="animate-spin inline-block size-5 self-center" />
        </span>
      {:else}
        <span class="inline-block">
          Tracks {entries_displayed.length} / {show_unavailable
            ? entries_cache.all.length
            : entries_cache.available.length}
        </span>
        {#if is_playlist_subset_playable}
          <button
            onclick={play_current_playlist}
            class="ml-auto font-normal hover:bg-accent rounded-md inline-flex align-bottom gap-x-1.5 py-0.5 pl-1 pr-1.5 text-base active:scale-[0.98]"
          >
            <Icon.Play /><span class="">Subset</span>
          </button>
        {/if}
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
      <ul class="grid grid-cols-[minmax(auto,64rem)] gap-y-8 sm:gap-y-0">
        {#if vl_items_before > 0}
          <div style="height: {vl_items_before}px;"></div>
        {/if}
        {#each vl_items as { index }, vl_items_index (index)}
          {@const { item, video } = entries_displayed[index]}
          <li bind:this={vl_elements[vl_items_index]} data-index={index} class="flex flex-col flex-1">
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
                  <div class="relative flex-none rounded-md overflow-hidden aspect-video sm:w-xs">
                    <img
                      src={video.img?.url}
                      width={video.img?.width}
                      height={video.img?.height}
                      alt="{video.title} video thumbnail"
                      class="size-full object-cover"
                    />
                    <div class="absolute bottom-2 right-2">
                      <span class="bg-accent px-1.5 py-1 rounded-md text-xs font-semibold tracking-wider">
                        {seconds_to_hhmmss(video.duration_s)}
                      </span>
                    </div>
                    <PlayCover size="md" />
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
                          {
                            label: "Playlists",
                            onSelect: () => {
                              playlists_menu.open_for_video_id(video.id);
                            },
                            icon_left: { Icon: Icon.Library },
                          },
                          {
                            label: "Open in YouTube",
                            href: video_url(video.id),
                            icon_left: { Icon: Icon.SquareArrowOutUpRight },
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </button>
            {:else}
              <div class="flex flex-col gap-4 px-4 py-2 w-full sm:flex-row">
                <div class="relative flex-none rounded-md overflow-hidden aspect-video sm:w-xs">
                  <img
                    src={video.img?.url}
                    width={video.img?.width}
                    height={video.img?.height}
                    alt="{video.title} video thumbnail"
                    class="size-full object-cover"
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
        {#if vl_items_after > 0}
          <div style="height: {vl_items_before}px;"></div>
        {/if}
      </ul>
    {/snippet}
  </PageSimple.Content>
</PageSimple.Root>
