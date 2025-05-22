<script lang="ts">
  import { Dialog } from "bits-ui";
  import type { ConfirmDialogRootProps } from "./shared.svelte.js";
  import { use_confirm_dialog_ctx } from "./shared.svelte.js";

  let { children, open = $bindable() }: ConfirmDialogRootProps = $props();

  const ctx = use_confirm_dialog_ctx({ get_open: () => open, set_open: (v) => (open = v) });
</script>

<Dialog.Root bind:open={ctx.get_open, ctx.set_open}>
  <Dialog.Portal>
    <Dialog.Overlay
      class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
    />
    <Dialog.Content
      class="rounded-md bg-background text-foreground outline-hidden fixed left-[50%] top-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] border border-border p-5 sm:max-w-[490px] md:w-full flex flex-col gap-4
      data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
      {children}
    />
  </Dialog.Portal>
</Dialog.Root>
