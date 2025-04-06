<script lang="ts">
  import { goto } from "$app/navigation";
  import { use_pinned_ctx } from "$lib/client/state/pinned.svelte.js";
  import HumanTime from "$lib/components/HumanTime.svelte";
  import * as Icon from "$lib/components/icons.js";
  import type { SortMode } from "$lib/components/menus/index.js";
  import { ActionsMenu, SortMenu } from "$lib/components/menus/index.js";
  import * as PageSimple from "$lib/components/page/PageSimple/index.js";
  import SearchInput from "$lib/components/SearchInput.svelte";
  import SourceLink from "$lib/components/sources/SourceLink.svelte";
  import * as Model from "$lib/models/index.js";
  import { uuid, type Tuple } from "$lib/utils/index.js";
  import { Searcher } from "$lib/utils/searcher.js";
  import type { PageData } from "./$types.js";

  type Props = {
    data: PageData;
  };

  type SortByMode = SortMode<Model.Playlist>;

  const SORT_MODES = [
    {
      id: "published_new",
      label: "Published newest",
      compare_fn: (a, b) => b.published_at.localeCompare(a.published_at),
    },
    {
      id: "published_old",
      label: "Published oldest",
      compare_fn: (a, b) => a.published_at.localeCompare(b.published_at),
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

  const searcher = new Searcher<Model.Playlist>({ mapper: (p) => p.title, on_empty_search: "all" });

  let { data }: Props = $props();

  $effect(() => {
    searcher.set(data.playlists);
  });

  const pinned_state = use_pinned_ctx();

  let channel = $derived(data.channel);
  let channel_is_pinned = $derived(pinned_state.is_pinned(channel.id));

  let search_query = $state("");
  let filtered_playlists = $derived.by(() => {
    if (search_query === "") {
      return [...data.playlists];
    }

    const out = searcher.search(search_query);
    return out;
  });

  let sort_by: SortByMode = $state(DEFAULT_SORT_MODE);

  let playlists = $derived.by(() => {
    const displayed = filtered_playlists.toSorted(sort_by.compare_fn);

    return {
      displayed: displayed,
    };
  });

  function on_play_playlist(id: string) {
    goto(`/play?l=${id}`);
  }
</script>

<PageSimple.Root>
  <PageSimple.Header img={channel.img} img_alt="{channel.title} profile avatar">
    {#snippet title()}
      {channel.title}
      <SourceLink type="channel" id={channel.id} title={channel.title} size="size-5" />
    {/snippet}
    {#snippet children()}
      Refreshed <HumanTime utc={channel.updated_at} as_relative />
    {/snippet}
    {#snippet actions()}
      <ActionsMenu
        actions={[
          {
            id: uuid(),
            label: channel_is_pinned ? "Unpin" : "Pin",
            action: () => {
              if (channel_is_pinned) {
                pinned_state.unpin_by_id(channel.id);
              } else {
                pinned_state.pin("channel", channel);
              }
            },
            icon: channel_is_pinned ? Icon.PinOff : Icon.Pin,
          },
        ]}
      />{/snippet}
  </PageSimple.Header>

  <PageSimple.Content>
    {#snippet title()}
      Playlists {playlists.displayed.length}
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
        {#each playlists.displayed as playlist (playlist.id)}
          {@const is_pinned = pinned_state.is_pinned(playlist.id)}
          <li class="flex flex-col flex-1">
            <button class="group text-left flex flex-1" onclick={() => on_play_playlist(playlist.id)}>
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
                            id: uuid(),
                            label: is_pinned ? "Unpin" : "Pin",
                            action: () => {
                              if (is_pinned) {
                                pinned_state.unpin_by_id(playlist.id);
                              } else {
                                pinned_state.pin("playlist", playlist);
                              }
                            },
                            icon: is_pinned ? Icon.PinOff : Icon.Pin,
                          },
                        ]}
                      />
                    </div>
                  </div>
                  <p class="mt-1 text-sm font-semibold text-muted">
                    <a href="/playlist/{playlist.id}" data-no-play class="hover:text-foreground"> View all tracks </a>
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
