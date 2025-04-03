<script lang="ts">
  import { insert_channel, select_channels } from "$lib/client/db/index.js";
  import { getPersistedState } from "$lib/client/state.svelte.js";
  import Input from "$lib/components/el/Input.svelte";
  import type * as Model from "$lib/models/youtube.js";
  import { superForm } from "sveltekit-superforms";

  let { data } = $props();
  let channels: Model.Channel[] = $state([]);
  let selected_channel = getPersistedState({ key: "selected_channel", initial: "" });

  const { form, enhance } = superForm(data.form, {
    onError: (ev) => {
      console.error(ev);
    },
    onUpdated: (ev) => {
      if (!ev.form.valid) {
        console.error("something happend", ev);
        return;
      }
      add_channel(ev.form.message.channel);
    },
  });

  async function add_channel(channel: Model.Channel) {
    const new_id = await insert_channel(channel);
    load_channels();
  }

  async function load_channels() {
    channels = await select_channels();
  }

  $effect(() => {
    load_channels();
  });
</script>

<main class="flex flex-col items-center h-full">
  <h1 class="text-4xl font-bold">lamezcla</h1>

  <form action="?/channel" method="post" use:enhance class="min-w-64">
    <div class="flex flex-col gap-1">
      <label for="input-handle">
        <span>Handle</span>
      </label>
      <Input
        type="text"
        id="input-handle"
        name="handle"
        value={$form.handle}
        oninput={(ev) => ($form.handle = ev.currentTarget.value)}
      />
    </div>
  </form>

  <ul class="mt-4 w-64 space-y-2">
    {#each channels as channel (channel.id)}
      <li>
        <a href="/{channel.handle}" class="grid px-2 w-full py-2 bg-accent rounded-md">
          <div class="flex gap-4 items-center">
            <div class="size-12 flex-none">
              {#if channel.img}
                <img
                  src={channel.img.url}
                  alt="{channel.title} profile thumbnail"
                  height={channel.img.height}
                  width={channel.img.width}
                  class="rounded-md overflow-clip shadow"
                />
              {/if}
            </div>
            <div class="font-bold text-xl leading-tight">
              {channel.title}
            </div>
          </div>
        </a>
      </li>
    {/each}
  </ul>
</main>
