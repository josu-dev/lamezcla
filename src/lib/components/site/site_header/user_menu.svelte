<script lang="ts">
  import * as db from "$data/local/db/index.js";
  import { ConfirmDialog } from "$lib/components/dialogs/index.js";
  import ButtonIcon from "$lib/components/el/ButtonIcon.svelte";
  import { Icon } from "$lib/components/icons/index.js";
  import { ActionsMenu } from "$lib/components/menus/index.js";

  function on_delete_app_data() {
    db.reset()
      .then(() => (window.location.href = window.location.origin))
      .catch(() => {});
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

<ConfirmDialog.Root bind:open={get_is_dialog_open, set_is_dialog_open}>
  <ConfirmDialog.Title>Application data deletion</ConfirmDialog.Title>
  <ConfirmDialog.Description>
    Deleting the application data will <b>permanently remove</b> all your loaded
    <b>channels, playlists, and videos</b>. This action will also <b>erase all information</b> generated while you've been
    using the application.
  </ConfirmDialog.Description>
  <ConfirmDialog.Actions>
    {#snippet confirm()}
      Are you sure you want to delete the application data?
    {/snippet}
    {#snippet actions()}
      <ConfirmDialog.Confirm on_confirm={on_delete_app_data}>
        {#snippet children(running)}
          {#if running}
            <Icon.LoaderCircle class="animate-spin" />
            <span>Deleting</span>
          {:else}
            <Icon.Shredder />
            <span>Delete</span>
          {/if}
        {/snippet}
      </ConfirmDialog.Confirm>
      <ConfirmDialog.Cancel>
        <Icon.X />
        <span>Cancel</span>
      </ConfirmDialog.Cancel>
    {/snippet}
  </ConfirmDialog.Actions>
</ConfirmDialog.Root>
