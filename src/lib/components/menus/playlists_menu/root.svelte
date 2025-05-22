<script lang="ts">
  import type { Model } from "$data/models/index.js";
  import Input from "$lib/components/el/Input.svelte";
  import { Icon } from "$lib/components/icons/index.js";
  import type { PlaylistForVideo } from "$lib/context/playlists.svelte.js";
  import { use_playlists_ctx } from "$lib/context/playlists.svelte.js";
  import { Dialog } from "bits-ui";

  type Props = {};

  const {}: Props = $props();

  const playlists = use_playlists_ctx();

  let open = $state(false);
  let video_id: string;
  let playlists_for_videos: PlaylistForVideo[] = $state([]);

  function get_open(): boolean {
    return open;
  }

  function set_open(value: boolean): void {
    open = value;
  }

  export function open_for_video_id(id: Model.StringId): void {
    video_id = id;
    playlists.get_lplaylists_for_video(id).then((values) => {
      playlists_for_videos = values.toSorted((a, b) => b.playlist.updated_at.localeCompare(a.playlist.updated_at));
      set_open(true);
    });
  }

  async function save_to_playlist(i: number) {
    const v = await playlists.add_to_playlist(playlists_for_videos[i].playlist.id, video_id);
    if (!v) {
      return;
    }

    playlists_for_videos[i].item = v;
  }

  async function remove_from_playlist(i: number) {
    const v = await playlists.remove_from_playlist(playlists_for_videos[i].playlist.id, video_id);
    if (!v) {
      return;
    }

    playlists_for_videos[i].item = undefined;
  }

  let new_open = $state(false);

  function get_new_open() {
    return new_open;
  }

  function set_new_open(value: boolean) {
    new_open = value;
    if (value) {
      return;
    }

    new_title = "";
    new_description = "";
  }

  let new_title = $state("");
  let new_description = $state("");
  let new_loading = $state(false);

  async function on_create() {
    if (new_loading) {
      return;
    }

    new_loading = true;
    const playlist = await playlists
      .create_lplaylist_for_video(new_title, new_description, video_id)
      .finally(() => (new_loading = false));

    playlists_for_videos = [playlist, ...playlists_for_videos];
    set_new_open(false);
  }
</script>

<Dialog.Root bind:open={get_open, set_open}>
  <Dialog.Portal>
    <Dialog.Overlay
      class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
    />
    <Dialog.Content
      data-inner-dialog={new_open ? "" : undefined}
      class="data-inner-dialog:hidden rounded-md bg-background text-foreground outline-hidden fixed left-[50%] top-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] border border-border p-5 sm:max-w-sm md:w-full flex flex-col gap-4
      data-[state=open]:animate-in  data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
    >
      <Dialog.Title class="flex w-full items-center justify-between text-xl font-semibold tracking-tight ">
        <div>Save to video</div>
        <Dialog.Close
          class="not-disabled:hover:bg-accent rounded-md inline-flex p-0.5 active:scale-[0.98] disabled:opacity-75"
        >
          <Icon.X />
        </Dialog.Close>
      </Dialog.Title>
      <ul class="max-h-[40vh] overflow-x-clip overflow-y-auto">
        {#each playlists_for_videos as { id, playlist, item }, i (id)}
          {@const is_saved = item !== undefined}
          <li class="">
            <button
              onclick={() => {
                if (is_saved) {
                  remove_from_playlist(i);
                } else {
                  save_to_playlist(i);
                }
              }}
              class="rounded-md hover:bg-accent flex w-full items-center text-sm font-medium px-2"
            >
              <div class="grid place-items-center size-8 mr-1.5">
                {#if is_saved}
                  <Icon.SquareCheckBig />
                {:else}
                  <Icon.Square />
                {/if}
                <!-- {#if action.icon_left}
                      {@const IconLeft = action.icon_left}
                      <IconLeft.Icon {...IconLeft.props} />
                    {/if} -->
              </div>
              <div class="flex mr-1.5 leading-none">
                {playlist.title}
              </div>
            </button>
          </li>
        {/each}
      </ul>
      <footer class="flex justify-center">
        <button
          onclick={() => set_new_open(true)}
          class="hover:bg-accent rounded-md inline-flex gap-x-2 py-0.5 px-1.5 active:scale-[0.98]"
        >
          <Icon.Plus />
          <span class="mr-1">New playlist</span>
        </button>
      </footer>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<Dialog.Root bind:open={get_new_open, set_new_open}>
  <Dialog.Portal>
    <Dialog.Content
      class="rounded-md bg-background text-foreground outline-hidden fixed left-[50%] top-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] border border-border p-5 sm:max-w-[490px] md:w-full  flex flex-col gap-4
       data-[state=open]:animate-in  data-[state=closed]:animate-out  data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
    >
      <Dialog.Title class="flex w-full items-center justify-center text-xl font-semibold tracking-tight">
        New playlist
      </Dialog.Title>
      <div>
        <label for="new-title" class="flex text-center font-medium"> Title </label>
        <Input type="text" id="new-title" name="title" bind:value={new_title} minlength={2} maxlength={128} />
      </div>
      <div>
        <label for="new-description" class="flex text-center font-medium"> Description </label>
        <Input
          type="text"
          id="new-description"
          name="description"
          bind:value={new_description}
          minlength={2}
          maxlength={128}
        />
      </div>

      <div class="flex justify-center gap-4 sm:gap-8 text-base mt-4">
        <button
          onclick={on_create}
          disabled={new_loading}
          class="hover:bg-accent rounded-md inline-flex gap-x-2 py-0.5 px-1.5 active:scale-[0.98]"
        >
          {#if new_loading}
            <Icon.LoaderCircle class="animate-spin" />
            <span>Creating</span>
          {:else}
            <Icon.Plus />
            <span>Create</span>
          {/if}
        </button>
        <Dialog.Close
          disabled={new_loading}
          class="not-disabled:hover:bg-accent rounded-md inline-flex gap-x-2 py-0.5 px-1.5 active:scale-[0.98] disabled:opacity-75"
        >
          <Icon.X class="" />
          <span>Cancel</span>
        </Dialog.Close>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
