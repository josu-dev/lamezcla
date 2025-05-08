<script lang="ts">
  import { page } from "$app/state";
  import { Icon } from "$lib/components/icons/index.js";
  import { Metadata, PageSimple } from "$lib/components/site/index.js";

  function status_to_text(status: number) {
    if (status === 404) {
      return "Not found";
    }
    if (status < 500) {
      return "Client error";
    }
    return "Server error";
  }

  const is404 = $derived(page.status === 404);

  const meta = $derived.by(() => {
    let title = `${page.status} ${status_to_text(page.status)}`;

    let description: string;
    if (page.status === 404) {
      description = `Page '${page.url.pathname}' unavailable`;
    } else if (page.status < 500) {
      description = `Something was wrong with the resquest to '${page.url.pathname}'`;
    } else {
      description = `Something went wrong on the server with the resquest to '${page.url.pathname}'`;
    }

    return { title, description };
  });

  const safe_pathname = $derived(
    page.url.pathname.length >= 64 ? page.url.pathname.slice(0, 61) + "..." : page.url.pathname,
  );
</script>

<Metadata title_default={meta.title} description={meta.description} />

<main class="flex flex-col h-page-content overflow-x-clip overflow-y-auto">
  <PageSimple.Header>
    {#snippet image()}
      <div class="text-3xl font-bold text-red-500">{page.status}</div>
    {/snippet}
    {#snippet title()}
      {status_to_text(page.status)}
    {/snippet}
  </PageSimple.Header>

  <div class="h-full grid grid-rows-6 max-w-lg mx-auto lg:max-w-screen-md px-4">
    <div class="row-start-1 row-span-4 grid">
      <div class="flex flex-col justify-center items-center">
        <h1 class="text-3xl font-bold text-center leading-tight">Shuffling went to far...</h1>
        <p class="mt-6 text-base-300 text-base text-balance text-center text-ellipsis">
          {#if is404}
            The page
            <span class="ring-1 ring-muted bg-base-950 py-0.5 px-1.5 rounded-md font-medium break-all"
              >{safe_pathname}</span
            > is not available. Please make sure the URL is correct. If it is, we may have moved or deleted the page.
          {:else}
            Something went wrong, but don't worry, you can go back to the homepage.
          {/if}
        </p>
      </div>
    </div>

    <div class="row-start-6 justify-self-center">
      <a href="/" class="text-base font-semibold hover:bg-accent rounded-md flex gap-2 py-1 px-2 focus-outline">
        <Icon.House />
        Home
      </a>
    </div>
  </div>
</main>
