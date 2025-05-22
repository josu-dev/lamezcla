<script lang="ts">
  import { Icon } from "$lib/components/icons/index.js";
  import * as ActionsMenu from "$lib/components/menus/actions_menu/index.js";
  import type { MenuOption } from "./shared.js";

  type Props = {
    label: string;
    options: MenuOption[];
  };

  const { label, options }: Props = $props();
  const groups: ActionsMenu.MenuActionGroup[] = $derived.by(() => {
    const items: ActionsMenu.MenuAction[] = new Array(options.length);
    for (let i = 0; i < items.length; i++) {
      const option = options[i];
      if ("href" in option) {
        const is_local = option.href.startsWith("/");
        const target = is_local ? undefined : "_blank";
        const rel = is_local ? undefined : "noopener noreferrer";
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
          disabled: option.disabled,
          props: {
            class: "aria-disabled:hidden",
            href: option.href,
            rel: rel,
            target: target,
          },
          tag: "a",
        };
      } else {
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
          disabled: option.disabled,
          props: { class: "aria-disabled:hidden" },
          tag: "button",
        };
      }
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

{#if groups.length > 0}
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
{/if}
