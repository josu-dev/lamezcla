<script lang="ts">
  import * as db from "$data/local/db/index.js";
  import ButtonIcon from "$lib/components/el/ButtonIcon.svelte";
  import { Icon } from "$lib/components/icons/index.js";
  import * as ActionsMenu from "$lib/components/menus/actions_menu/index.js";
  import { Dialog, Separator } from "bits-ui";

  let is_deleting = $state(false);

  function on_delete_app_data() {
    if (is_deleting) return;
    is_deleting = true;

    db.reset()
      .then(() => (window.location.href = window.location.origin))
      .catch(() => (is_deleting = false));
  }

  let is_dialog_delete_open = $state(false);

  function get_is_dialog_open() {
    return is_dialog_delete_open;
  }

  function set_is_dialog_open(value: boolean) {
    is_dialog_delete_open = value;
  }

  const groups: ActionsMenu.MenuActionGroup[] = [
    {
      id: 1,
      label: "Account",
      items: [
        {
          id: 1,
          label: "Me",
          tag: "a",
          props: { href: `/@me` },
          icon_left: { Icon: Icon.User, props: { class: "size-5" } },
        },
      ],
    },
    {
      id: 2,
      label: "Application",
      items: [
        {
          id: 1,
          label: "Reload app",
          onSelect: (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            window.location.href = window.location.href;
          },
          tag: "button",
          icon_left: { Icon: Icon.RotateCw, props: { class: "size-5" } },
        },
        {
          id: 2,
          label: "Delete app data",
          onSelect: () => set_is_dialog_open(true),
          tag: "button",
          icon_left: { Icon: Icon.Shredder, props: { class: "size-5" } },
        },
      ],
    },
  ];
</script>

<ActionsMenu.Root>
  <ActionsMenu.Trigger onclick={(ev) => ev.stopPropagation()}>
    {#snippet children({ props })}
      <ButtonIcon size="md" title="Open menu" {...props}>
        <Icon.User class="text-foreground size-full" />
      </ButtonIcon>
    {/snippet}
  </ActionsMenu.Trigger>
  <ActionsMenu.Portal>
    <ActionsMenu.Content {groups} align="end" alignOffset={4} side="bottom" sideOffset={4} />
  </ActionsMenu.Portal>
</ActionsMenu.Root>

<Dialog.Root bind:open={get_is_dialog_open, set_is_dialog_open}>
  <Dialog.Portal>
    <Dialog.Overlay
      class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
    />
    <Dialog.Content
      class="rounded-md bg-background text-foreground outline-hidden fixed left-[50%] top-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] border border-border p-5 sm:max-w-[490px] md:w-full
      data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
    >
      <Dialog.Title class="flex w-full items-center justify-center text-xl font-semibold tracking-tight">
        Application data deletion
      </Dialog.Title>
      <Separator.Root class="bg-border -mx-5 my-4 block h-px" />
      <Dialog.Description class="text-sm text-pretty">
        <p>
          Deleting the application data will <b>permanently remove</b> all your loaded
          <b>channels, playlists, and videos</b>. This action will also <b>erase all information</b> generated while you've
          been using the application.
        </p>
      </Dialog.Description>
      <div class="flex flex-col gap-4 mt-4">
        <p class="text-sm">Are you sure you want to delete the application data?</p>
        <div class="flex justify-center gap-4 sm:gap-8 text-base">
          <Dialog.Close
            class="not-disabled:hover:bg-accent rounded-md inline-flex gap-x-2 py-0.5 px-1.5 active:scale-[0.98] disabled:opacity-75"
            disabled={is_deleting}
          >
            <div class="h-6 overflow-hidden">
              <Icon.X class="scale-125 -mr-0.5" />
            </div>
            <span>Cancel</span>
          </Dialog.Close>
          <button
            onclick={on_delete_app_data}
            class="hover:bg-accent rounded-md inline-flex gap-x-2 py-0.5 px-1.5 active:scale-[0.98]"
          >
            {#if is_deleting}
              <Icon.LoaderCircle class="animate-spin" />
              <span>Deleting</span>
            {:else}
              <Icon.Shredder />
              <span>Delete</span>
            {/if}
          </button>
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
