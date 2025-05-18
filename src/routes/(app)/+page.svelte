<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/components/el/Button.svelte";
  import Input from "$lib/components/el/Input.svelte";
  import { Icon } from "$lib/components/icons/index.js";
  import { Metadata } from "$lib/components/site/index.js";
  import { toast } from "$lib/components/Toaster.svelte";
  import type { ElEvent } from "$lib/utils/index.js";
  import type { Component } from "svelte";
  import { superForm } from "sveltekit-superforms";
  import type { Query, QueryMode } from "./shared.js";
  import { parse_query } from "./shared.js";

  let { data } = $props();

  let query: Query = $state.raw({
    raw: "",
    mode: "",
    value: "",
  });

  const { enhance } = superForm(data.form, {
    onSubmit({ cancel }) {
      if (query.mode === "") {
        toast.error("Enter a valid text");
        cancel();
        return;
      }
    },
    onError: ({ result }) => {
      if (typeof result.error === "string") {
        toast.error(result.error);
      }
    },
    onUpdated: ({ form }) => {
      const message = form.message;
      if (!form.valid || message.is_error) {
        let msg = "";
        if (form.errors._errors !== undefined) {
          msg = String(form.errors._errors);
        } else if (message.is_error) {
          if (message.status === 404) {
            msg = `Nothing found with '${message.query.raw}'`;
          } else {
            msg = message.error;
          }
        }

        toast.error(msg);
        console.warn(form);
        return;
      }

      const redirect_to = message.redirect_to;
      goto(redirect_to);
    },
  });

  function on_input(ev: ElEvent<HTMLInputElement, Event>) {
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

<Metadata description="Just search any public playlists to enjoy all the tracks they have well SHUFFLED." />

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
        <Button title="Search" class="flex items-center px-2 py-1 gap-2 text-base">
          <Icon class="" /> Search
        </Button>
      {:else}
        <span class="text-muted">
          {#if query.raw}
            Type more...
          {:else}
            Type something
          {/if}
        </span>
      {/if}
    </div>
  </form>
</main>
