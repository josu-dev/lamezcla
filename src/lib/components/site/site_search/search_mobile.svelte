<script lang="ts">
  import { onNavigate } from "$app/navigation";
  import ButtonIcon from "$lib/components/el/ButtonIcon.svelte";
  import { Icon } from "$lib/components/icons/index.js";
  import { Dialog } from "bits-ui";
  import { tick } from "svelte";
  import SearchForm from "./search_form.svelte";

  let open = $state(false);

  function set_open(value: boolean) {
    open = value;
    if (value === false) {
      setTimeout(() => {
        tick().then(() => {
          document.body.style.pointerEvents = "";
          document.body.style.overflow = "";
        });
      }, 150);
    }
  }

  onNavigate(() => {
    set_open(false);
  });
</script>

<Dialog.Root bind:open={() => open, set_open}>
  <Dialog.Trigger>
    {#snippet child({ props })}
      <ButtonIcon {...props} size="md" title="Open search" class="lg:hidden">
        <Icon.Search class="text-foreground size-full" />
      </ButtonIcon>
    {/snippet}
  </Dialog.Trigger>

  <Dialog.Portal>
    <Dialog.Overlay
      class="fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
    />
    <Dialog.Content
      class="bg-background fixed z-50 top-0 bottom-0 right-0 border-l border-border w-xs max-w-[min(100%,var(--container-sm))] !duration-200 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full"
    >
      <div class="flex h-site-header flex-none items-center justify-between px-2 border-b border-border">
        <Dialog.Title class="text-xl font-semibold">Search</Dialog.Title>
        <Dialog.Close>
          {#snippet child({ props })}
            <ButtonIcon {...props} size="md" title="Close search">
              <Icon.X class="text-foreground size-full" />
            </ButtonIcon>
          {/snippet}
        </Dialog.Close>
      </div>
      <div class="p-4">
        <p class="mb-3 text-sm text-muted">Enter a <span class="font-bold">@handle</span> or <span class="font-bold">YT link</span></p>
        <SearchForm input_id="header-mobile-search" class="w-full" on_navigate={() => set_open(false)} />
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
