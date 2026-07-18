<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import Button from "$lib/components/el/Button.svelte";
  import Input from "$lib/components/el/Input.svelte";
  import { Icon } from "$lib/components/icons/index.js";
  import { toast } from "$lib/components/Toaster.svelte";
  import { parse_query, type Query, type QueryMode } from "$lib/utils/parse_yt_query.js";
  import type { ElEvent } from "$lib/utils/index.js";
  import type { ActionResult, SubmitFunction } from "@sveltejs/kit";
  import type { Component } from "svelte";

  type Props = {
    input_id: string;
    class?: string;
    on_navigate?: () => void;
    show_focus_icon?: boolean;
  };

  type SearchMessage = {
    query: Query;
    is_error: boolean;
    error?: string;
    status?: number;
    redirect_to?: string;
  };

  type SearchActionData = {
    form?: {
      valid: boolean;
      errors?: {
        _errors?: unknown;
      };
      message?: SearchMessage;
    };
  };

  let { input_id, class: classes = "", on_navigate, show_focus_icon = false }: Props = $props();

  let query: Query = $state.raw({
    raw: "",
    mode: "",
    value: "",
  });

  const mode_to_icon: Record<QueryMode, Component> = {
    "": Icon.Search,
    c: Icon.User,
    ch: Icon.User,
    pl: Icon.ListVideo,
    v: Icon.Music,
  };

  const StatusIcon = $derived.by(() => {
    if (query.mode !== "") {
      return mode_to_icon[query.mode];
    }
    if (query.raw.length === 0) {
      return Icon.Search;
    }
    if (query.raw.length < 20) {
      return Icon.Ellipsis;
    }

    return Icon.CircleHelp;
  });

  function resolve_path(path: string) {
    return `${base}${path}`;
  }

  function on_input(ev: ElEvent<HTMLInputElement, Event>) {
    const v = ev.currentTarget.value;
    if (v === query.raw) {
      return;
    }

    query = parse_query(v);
  }

  function get_action_data(result: ActionResult): SearchActionData | undefined {
    if (result.type !== "success" && result.type !== "failure") {
      return undefined;
    }

    return result.data as SearchActionData;
  }

  function get_error_message(data: SearchActionData | undefined) {
    const message = data?.form?.message;
    if (data?.form?.errors?._errors !== undefined) {
      return String(data.form.errors._errors);
    }
    if (message?.status === 404) {
      return `Nothing found with '${message.query.raw}'`;
    }

    return message?.error ?? "Something happend, try again later";
  }

  const enhance_search: SubmitFunction = ({ cancel }) => {
    if (query.mode === "") {
      toast.error("Enter a valid text to search");
      cancel();
      return;
    }

    return async ({ result }) => {
      if (result.type === "error") {
        toast.error("Something happend, try again later");
        return;
      }
      if (result.type === "redirect") {
        on_navigate?.();
        await goto(resolve_path(result.location));
        return;
      }

      const data = get_action_data(result);
      const message = data?.form?.message;
      if (!data?.form?.valid || message?.is_error || !message?.redirect_to) {
        toast.error(get_error_message(data));
        return;
      }

      on_navigate?.();
      await goto(resolve_path(message.redirect_to));
    };
  };
</script>

<form action={resolve_path("/?/search")} method="post" use:enhance={enhance_search} class="flex items-center {classes}">
  <label for={input_id} class="sr-only">Search by @handle or YouTube link</label>
  <div class={["relative flex min-w-0 flex-1", show_focus_icon && "group/search"]}>
    {#if show_focus_icon}
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-y-0 right-0 left-0 rounded-md border border-border bg-background transition-[left,border-color] duration-200 ease-out group-focus-within/search:-left-5 group-focus-within/search:border-foreground motion-reduce:transition-none"
      ></div>
      <StatusIcon
        aria-hidden="true"
        class="pointer-events-none absolute top-1/2 -left-3 z-10 size-4 -translate-y-1/2 text-muted opacity-0 transition-opacity duration-200 group-focus-within/search:opacity-100 motion-reduce:transition-none"
      />
    {/if}
    <Input
      type="text"
      id={input_id}
      name="query"
      value={query.raw}
      oninput={on_input}
      minlength={2}
      maxlength={128}
      placeholder="@handle or YT link"
      autocomplete="off"
      style={show_focus_icon ? "border-color: transparent; background-color: transparent" : undefined}
      class="relative h-9 min-w-0 flex-1 rounded-r-none border-r-0 px-3 placeholder:text-muted placeholder:opacity-100"
    />
    <Button
      type="submit"
      title="Search"
      disabled={query.mode === ""}
      style={show_focus_icon ? "border-color: transparent" : undefined}
      class="relative grid h-9 w-10 shrink-0 place-items-center rounded-l-none border border-border p-2"
    >
      <span class="sr-only">Search</span>
      <Icon.Search />
    </Button>
  </div>
</form>
