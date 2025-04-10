<script lang="ts">
  import { goto } from "$app/navigation";
  import { use_channel_ctx } from "$lib/client/state/channels.svelte.js";
  import Button from "$lib/components/el/Button.svelte";
  import Input from "$lib/components/el/Input.svelte";
  import * as Icon from "$lib/components/icons.js";
  import type { ElEvent } from "$lib/utils/index.js";
  import type { Component } from "svelte";
  import { superForm } from "sveltekit-superforms";

  let { data } = $props();

  let channel_state = use_channel_ctx();

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
      channel_state.add(channel).then(() => {
        goto("/" + channel.handle);
      });
    },
  });

  type QueryMode = "" | "v" | "c" | "ch" | "pl";

  type Query = {
    raw: string;
    mode: QueryMode;
    value: string;
  };

  let query: Query = $state.raw({
    raw: "",
    mode: "",
    value: "",
  });

  const ytlink_re =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?.*v=(?<v_id1>[\w-]+)(?:.*&list=(?<pl_id1>[\w-]+))?|playlist\?.*list=(?<pl_id2>[\w-]+)|(?<handle>@[\w-]+)|channel\/(?<c_id1>[\w-]+))|youtu\.be\/(?<v_id2>[\w-]+))/i;

  function infer_query(v: string): Query {
    if (v.startsWith("@")) {
      return {
        raw: v,
        mode: "ch",
        value: v,
      };
    }

    if (v.length < 21) {
      return {
        raw: v,
        mode: "",
        value: "",
      };
    }

    const r = ytlink_re.exec(v);
    if (r === null) {
      return {
        raw: v,
        mode: "",
        value: "",
      };
    }

    let mode: QueryMode = "";
    let value = "";
    const groups = r.groups!;
    const video_id = groups.v_id1 ?? groups.v_id2;
    const playlist_id = groups.pl_id1 ?? groups.pl_id2;
    const handle = groups.handle;
    const channel_id = groups.c_id1;
    if (video_id?.length) {
      mode = "v";
      value = video_id;
    }
    if (playlist_id?.length) {
      mode = "pl";
      value = playlist_id;
    } else if (handle?.length) {
      mode = "ch";
      value = handle;
    } else if (channel_id?.length) {
      mode = "c";
      value = channel_id;
    }

    return {
      raw: v,
      mode: mode,
      value: value,
    };
  }

  function on_input(ev: ElEvent<Event, HTMLInputElement>) {
    const v = ev.currentTarget.value;
    if (v === query.raw) {
      return;
    }

    query = infer_query(v);
  }

  const mode_to_icon: Record<QueryMode, Component> = {
    "": Icon.User,
    c: Icon.User,
    ch: Icon.User,
    pl: Icon.ListVideo,
    v: Icon.Music,
  };
</script>

<main class="flex flex-col items-center h-full">
  <h1 class="text-4xl font-bold mt-[1em]">lamezcla</h1>

  <form action="?/search" method="post" use:enhance class="flex flex-col min-w-80 mt-8">
    <div class="flex flex-col gap-1">
      <label for="input-query" class="flex text-center">
        <span class="font-medium"
          >Enter a <span class="font-bold">@handle</span> or a <span class="font-bold">YT link</span></span
        >
      </label>
      <Input type="text" id="input-query" name="query" defaultValue={query.raw} oninput={on_input} minlength={2} />
    </div>
    <div class="mx-auto mt-4">
      {#if query.mode}
        {@const Icon = mode_to_icon[query.mode]}
        <Button title="Search" class="flex items-center pl-2.5 pr-2 py-1 gap-2">
          Search <Icon class="" />
        </Button>
      {:else}
        <span class="text-muted">Enter something...</span>
      {/if}
    </div>
  </form>
</main>
