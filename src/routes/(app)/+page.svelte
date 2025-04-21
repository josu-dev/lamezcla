<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/components/el/Button.svelte";
  import Input from "$lib/components/el/Input.svelte";
  import { Icon } from "$lib/components/icons/index.js";
  import type { ElEvent } from "$lib/utils/index.js";
  import type { Component } from "svelte";
  import { superForm } from "sveltekit-superforms";
  import type { Query, QueryMode } from "./shared.js";
  import { parse_query } from "./shared.js";

  let { data } = $props();

  const { form, enhance } = superForm(data.form, {
    onError: (ev) => {
      console.error(ev);
    },
    onUpdated: (ev) => {
      if (!ev.form.valid) {
        console.error("something happend", ev);
        return;
      }

      const msg = ev.form.message;
      if (msg.is_error) {
        console.error(msg);
        return;
      }

      const redirect_to = msg.redirect_to;
      goto(redirect_to);
    },
  });

  let query: Query = $state.raw({
    raw: "",
    mode: "",
    value: "",
  });

  function on_input(ev: ElEvent<Event, HTMLInputElement>) {
    const v = ev.currentTarget.value;
    if (v === query.raw) {
      return;
    }

    query = parse_query(v);
  }

  const mode_to_icon: Record<QueryMode, Component> = {
    "": Icon.User,
    c: Icon.User,
    ch: Icon.User,
    pl: Icon.ListVideo,
    v: Icon.Music,
  };
</script>

<main class="grid grid-rows-[30%_auto_1fr] place-items-center h-full">
  <h1 class="text-4xl font-bold self-end">lamezcla</h1>

  <form action="?/search" method="post" use:enhance class="flex flex-col w-80 mt-8">
    <div class="flex flex-col gap-1">
      <label for="input-query" class="flex text-center">
        <span class="font-medium"
          >Enter a <span class="font-bold">@handle</span> or <span class="font-bold">YT link</span></span
        >
      </label>
      <Input
        type="text"
        id="input-query"
        name="query"
        defaultValue={query.raw}
        oninput={on_input}
        minlength={2}
        maxlength={128}
      />
    </div>
    <div class="mx-auto mt-4">
      {#if query.mode}
        {@const Icon = mode_to_icon[query.mode]}
        <Button title="Search" class="flex items-center pl-2.5 pr-2 py-1 gap-2">
          Search <Icon class="" />
        </Button>
      {:else}
        <span class="text-muted">
          {#if query.raw}
            Type more...
          {:else}
            Type something...
          {/if}
        </span>
      {/if}
    </div>
  </form>
</main>
