<script lang="ts">
  import { onNavigate } from "$app/navigation";
  import ButtonIcon from "$lib/components/el/ButtonIcon.svelte";
  import { Icon } from "$lib/components/icons/index.js";
  import { Dialog } from "bits-ui";
  import { tick } from "svelte";
  import type { SidebarMobileProps } from "./internal.js";
  import { use_site_sidebar_ctx } from "./sidebar.svelte.js";
  import SidebarContent from "./sidebar_content.svelte";

  let {}: SidebarMobileProps = $props();

  const state = use_site_sidebar_ctx();

  function set_open(value: boolean) {
    state.open = value;
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

<Dialog.Root bind:open={() => state.open, set_open}>
  <Dialog.Trigger>
    {#snippet child({ props })}
      <ButtonIcon size="md" title="Open menu" {...props}>
        <Icon.Menu class="text-foreground size-full" />
      </ButtonIcon>
    {/snippet}
  </Dialog.Trigger>

  <Dialog.Portal>
    <Dialog.Overlay
      class="fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
    />
    <Dialog.Content
      class="bg-background fixed z-50 top-0 bottom-0 left-0 border-r border-border w-xs max-w-[min(100%,var(--container-sm))] !duration-200 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left-full data-[state=open]:animate-in data-[state=open]:slide-in-from-left-full"
    >
      <div class="flex h-site-header flex-none px-2 border-b border-border">
        <div class="flex items-center mr-1">
          <Dialog.Close>
            {#snippet child({ props })}
              <ButtonIcon {...props} size="md" title="Close menu">
                <Icon.Menu class="text-foreground size-full " />
              </ButtonIcon>
            {/snippet}
          </Dialog.Close>
        </div>
        <div class="flex items-center">
          <a href="/" class="flex items-center text-3xl font-medium">
            <Icon.Shuffle class="block size-6 mb-0.5 mr-2" />
            <span>lamezcla</span>
          </a>
        </div>
      </div>
      <div class="max-h-site-content flex flex-col">
        <SidebarContent />
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
