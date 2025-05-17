<script lang="ts">
  import { goto } from "$app/navigation";
  import { refresh_local_channel_and_playlists } from "$data/local/db/refresh.js";
  import type { Model } from "$data/models/index.js";
  import HumanTime from "$lib/components/HumanTime.svelte";
  import { Icon } from "$lib/components/icons/index.js";
  import type { SortMode } from "$lib/components/menus/index.js";
  import { ActionsMenu, SortMenu } from "$lib/components/menus/index.js";
  import SearchInput from "$lib/components/SearchInput.svelte";
  import { Metadata, PageSimple } from "$lib/components/site/index.js";
  import SourceLink from "$lib/components/sources/SourceLink.svelte";
  import { use_followed_ctx, use_pinned_ctx } from "$lib/context/index.js";
  import { is_play_prevented, use_async_callback, uuidv4, type Tuple } from "$lib/utils/index.js";
  import { Searcher } from "$lib/utils/searcher.js";
  import type { PageData } from "./$types.js";

  type Props = {
    data: PageData;
  };

  type SortByMode = SortMode<Model.AnyPlaylist>;

  const SORT_MODES = [
    {
      id: "published_new",
      label: "Published newest",
      compare_fn: (a, b) => b.created_at.localeCompare(a.created_at),
    },
    {
      id: "published_old",
      label: "Published oldest",
      compare_fn: (a, b) => a.created_at.localeCompare(b.created_at),
    },
    {
      id: "title_az",
      label: "Title A to Z",
      compare_fn: (a, b) => a.title.localeCompare(b.title),
    },
    {
      id: "title_za",
      label: "Title Z to A",
      compare_fn: (a, b) => b.title.localeCompare(a.title),
    },
    {
      id: "tracks_01",
      label: "Track count - to +",
      compare_fn: (a, b) => a.item_count - b.item_count,
    },
    {
      id: "tracks_10",
      label: "Track count + to -",
      compare_fn: (a, b) => b.item_count - a.item_count,
    },
  ] satisfies Tuple<SortByMode>;

  const DEFAULT_SORT_MODE = SORT_MODES[0];

  const searcher = new Searcher<Model.AnyPlaylist>({ mapper: (p) => p.title, on_empty_search: "all" });

  let { data }: Props = $props();

  const followed_state = use_followed_ctx();
  const pinned_state = use_pinned_ctx();

  let data_channel = $derived(data.channel);
  let data_playlists = $derived(data.playlists);

  const channel_is_followed = $derived(followed_state.is_followed(data_channel.id));
  const channel_is_pinned = $derived(pinned_state.is_pinned(data_channel.id));

  const playlists_cache = $derived.by(() => {
    const all: Model.AnyPlaylist[] = new Array(data_playlists.length);
    const empty: Model.AnyPlaylist[] = [];

    for (let i = 0; i < data_playlists.length; i++) {
      const p = data_playlists[i];
      all[i] = p;
      if (p.item_count < 1) {
        empty.push(p);
      }
    }

    return {
      all: all,
      empty: empty,
    };
  });

  const some_playlist_empty = $derived(playlists_cache.empty.length > 0);
  $effect(() => {
    searcher.set(playlists_cache.all);
  });

  let search_query = $state("");
  const playlists_filtered = $derived.by(() => {
    if (search_query === "") {
      return playlists_cache.all;
    }

    const out = searcher.search(search_query);
    return out;
  });

  let sort_by: SortByMode = $state(DEFAULT_SORT_MODE);
  let playlists_displayed = $derived.by(() => {
    const out = playlists_filtered.toSorted(sort_by.compare_fn);
    return out;
  });

  function on_play_playlist(id: string) {
    goto(`/play?l=${id}`);
  }

  const refresh_channel = use_async_callback({
    fn: refresh_local_channel_and_playlists,
    on_err: (error) => {
      console.error(error);
    },
    on_ok: (value) => {
      data_channel = value.channel;
      data_playlists = value.playlists;
    },
  });
</script>

<Metadata
  description="Just search what playlists '{data_channel.title}' has to offer.{playlists_cache.all.length === 0
    ? " Sadly there isn't any playlist."
    : ` Select one of ${playlists_cache.all.length}.`}"
/>

<PageSimple.Root>
  <PageSimple.Header>
    {#snippet image()}
      <PageSimple.HeaderImage img={data_channel.img} alt="{data_channel.title} profile avatar" />
    {/snippet}
    {#snippet title()}
      {data_channel.title}
      <SourceLink type="channel" id={data_channel.id} title={data_channel.title} size="size-5" />
    {/snippet}
    {#snippet children()}
      <div class="font-bold text-foreground text-base select-text">
        {"handle" in data_channel ? data_channel.handle : ""}
      </div>
      <div class="font-normal">
        <div>
          Created <HumanTime utc={data_channel.created_at} as_relative />
        </div>
        <div>
          {data_playlists.length} playlists{#if some_playlist_empty}, {playlists_cache.empty.length} empty{/if}
        </div>
        <!-- <div>
          Last refresh <HumanTime utc={data_channel.updated_at} as_relative />
        </div> -->
      </div>
    {/snippet}
    {#snippet actions()}
      <ActionsMenu
        actions={[
          {
            id: uuidv4(),
            label: "Refresh",
            action: () => {
              refresh_channel.fn(data_channel.id);
            },
            icon: refresh_channel.running ? Icon.LoaderCircle : Icon.RefreshCw,
            icon_props: { class: refresh_channel.running ? "animate-spin" : "" },
          },
          {
            id: uuidv4(),
            label: channel_is_followed ? "Unfollow" : "Follow",
            action: () => {
              if (channel_is_followed) {
                followed_state.unfollow(data_channel as Model.YChannel);
              } else {
                followed_state.follow(data_channel as Model.YChannel);
              }
            },
            icon: channel_is_followed ? Icon.UserX : Icon.UserPlus,
          },
          {
            id: uuidv4(),
            label: channel_is_pinned ? "Unpin" : "Pin",
            action: () => {
              if (channel_is_pinned) {
                pinned_state.unpin_by_id(data_channel.id);
              } else {
                pinned_state.pin("channel", data_channel as Model.YChannel);
              }
            },
            icon: channel_is_pinned ? Icon.PinOff : Icon.Pin,
          },
        ]}
      />
    {/snippet}
  </PageSimple.Header>

  <PageSimple.Content>
    {#snippet title()}
      Playlists {playlists_displayed.length}
    {/snippet}
    {#snippet actions()}
      <SearchInput label="Search playlist" oninput={(ev) => (search_query = ev.currentTarget.value)} maxlength={32} />
      <SortMenu
        current={sort_by}
        modes={SORT_MODES}
        on_selected={(mode) => {
          sort_by = mode;
        }}
      />
    {/snippet}
    {#snippet children()}
      <ul class="grid grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] gap-2">
        {#each playlists_displayed as playlist (playlist.id)}
          {@const is_pinned = pinned_state.is_pinned(playlist.id)}
          <li class="flex flex-col flex-1">
            <button
              class="group text-left flex mr-auto"
              onclick={(e) => {
                if (is_play_prevented(e)) {
                  return;
                }
                on_play_playlist(playlist.id);
              }}
            >
              <div class="flex flex-col px-4 py-2">
                <div class="relative">
                  <img
                    src={playlist.img?.url}
                    width={playlist.img?.width}
                    height={playlist.img?.height}
                    alt="{playlist.title} playlist thumbnail"
                    class="rounded-md w-full aspect-video object-fill"
                  />
                  <div
                    class="absolute grid opacity-0 [&:is(:where(.group):hover:not(:has([data-no-play]:hover))_*)]:opacity-100 transition-opacity place-items-center inset-0 bg-background/75"
                  >
                    <div class="flex items-center gap-2 text-2xl font-semibold">
                      <Icon.Play class="size-8 stroke-2" /> Play
                    </div>
                  </div>
                  <div class="absolute bottom-2 right-2">
                    <span class="bg-accent px-1.5 py-1 rounded-md text-xs font-semibold tracking-wider">
                      ≈ {playlist.item_count} tracks
                    </span>
                  </div>
                </div>
                <div>
                  <div class="flex">
                    <h3 class="text-lg font-semibold mt-2">{playlist.title}</h3>
                    <div class="mt-2 ml-auto relative" data-no-play>
                      <ActionsMenu
                        actions={[
                          {
                            id: uuidv4(),
                            label: is_pinned ? "Unpin" : "Pin",
                            action: () => {
                              if (is_pinned) {
                                pinned_state.unpin_by_id(playlist.id);
                              } else {
                                if (playlist.tag === "l") {
                                  pinned_state.pin("lplaylist", playlist);
                                } else {
                                  pinned_state.pin("yplaylist", playlist);
                                }
                              }
                            },
                            icon: is_pinned ? Icon.PinOff : Icon.Pin,
                          },
                        ]}
                      />
                    </div>
                  </div>
                  <p class="mt-1 text-sm font-semibold text-muted">
                    <a
                      href="/playlist/{playlist.id}"
                      data-no-play
                      class="focus-outline rounded-xs hover:text-foreground"
                    >
                      View all tracks
                    </a>
                  </p>
                </div>
              </div>
            </button>
          </li>
        {/each}
      </ul>
    {/snippet}
  </PageSimple.Content>
</PageSimple.Root>
