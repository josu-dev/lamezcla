<script lang="ts">
  import { Icon } from "$lib/components/icons/index.js";
  import * as ActionsMenu from "$lib/components/menus/actions_menu/index.js";

  type MenuOption = {
    label: string;
    onSelect: ActionsMenu.MenuAction["onSelect"] & {};
    icon_left: ActionsMenu.MenuAction["icon_left"] & {};
  };

  type Props = {
    label: string;
    options: MenuOption[];
  };

  const { label, options }: Props = $props();
  const groups: ActionsMenu.MenuActionGroup[] = $derived.by(() => {
    const items: ActionsMenu.MenuAction[] = new Array(options.length);
    for (let i = 0; i < items.length; i++) {
      const option = options[i];
      items[i] = {
        id: i + 1,
        label: option.label,
        onSelect: option.onSelect,
        icon_left: {
          Icon: option.icon_left.Icon,
          props: {
            ...option.icon_left.props,
            class: "size-5 " + (option.icon_left.props?.class ?? ""),
          },
        },
        tag: "button",
      };
    }
    return [
      {
        id: 1,
        label: label,
        items: items,
      },
    ];
  });
</script>

<ActionsMenu.Root>
  <ActionsMenu.Trigger onclick={(ev) => ev.stopPropagation()}>
    {#snippet children({ props })}
      <button {...props} title={label} class="hover:bg-accent p-0.5 rounded-md inline-flex active:scale-[0.98]">
        <Icon.EllipsisVertical class="" />
        <span class="sr-only">{label}</span>
      </button>
    {/snippet}
  </ActionsMenu.Trigger>
  <ActionsMenu.Portal>
    <ActionsMenu.Content {groups} sideOffset={8} align="end" side="bottom" />
  </ActionsMenu.Portal>
</ActionsMenu.Root>
