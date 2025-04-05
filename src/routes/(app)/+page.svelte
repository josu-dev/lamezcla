<script lang="ts">
  import { goto } from "$app/navigation";
  import { insert_channel } from "$lib/client/db/index.js";
  import { use_channel_ctx } from "$lib/client/state/channels.svelte.js";
  import Button from "$lib/components/el/Button.svelte";
  import Input from "$lib/components/el/Input.svelte";
  import * as Icon from "$lib/components/icons.js";
  import type * as Model from "$lib/models/youtube.js";
  import { superForm } from "sveltekit-superforms";

  let { data } = $props();

  let cstate = use_channel_ctx();

  const { form, enhance } = superForm(data.form, {
    onError: (ev) => {
      console.error(ev);
    },
    onUpdated: (ev) => {
      if (!ev.form.valid) {
        console.error("something happend", ev);
        return;
      }

      const channel = ev.form.message.channel;
      add_channel(channel).then(() => {
        goto("/" + channel.handle);
      });
    },
  });

  async function add_channel(channel: Model.Channel) {
    const new_id = await insert_channel(channel);
    cstate.sync();
  }
</script>

<main class="flex flex-col items-center h-full">
  <h1 class="text-4xl font-bold mt-[1em]">lamezcla</h1>

  <form action="?/channel" method="post" use:enhance class="flex flex-col min-w-64 mt-8">
    <div class="flex flex-col gap-1">
      <label for="input-handle" class="flex">
        <span class="font-semibold">Youtube channel </span><span class="text-muted text-sm ml-auto">( @handle )</span>
      </label>
      <Input
        type="text"
        id="input-handle"
        name="handle"
        value={$form.handle}
        oninput={(ev) => ($form.handle = ev.currentTarget.value)}
      />
    </div>
    <div class="mx-auto mt-4">
      <Button title="Load" size="md">
        <Icon.UserPlus />
      </Button>
    </div>
  </form>
</main>
