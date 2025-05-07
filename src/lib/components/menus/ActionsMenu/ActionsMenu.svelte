<script lang="ts">
  import { Icon } from "$lib/components/icons/index.js";
  import type { LucideComponent } from "@lucide/svelte";
  import { DropdownMenu } from "bits-ui";
  import type { Component, ComponentProps } from "svelte";

  type Action = {
    id: string;
    label: string;
    action: (ev: Event) => void;
  } & (
    | {
        icon?: never;
        icon_props?: never;
      }
    | {
        icon: Component;
        icon_props?: ComponentProps<typeof LucideComponent>;
      }
  );

  type Props = {
    actions: Action[];
  };

  let { actions }: Props = $props();
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger
    onclick={(ev) => ev.stopPropagation()}
    class=" hover:bg-accent p-0.5 rounded-md inline-flex active:scale-[0.98]"
  >
    <Icon.EllipsisVertical class="" />
  </DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    <DropdownMenu.Content
      class="border-border bg-accent w-full min-w-32 max-w-64 rounded-md border py-2
      data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
      sideOffset={8}
      align="end"
      side="bottom"
    >
      {#each actions as action (action.id)}
        {@const Icon = action.icon}
        <DropdownMenu.Item
          onSelect={(ev) => {
            action.action(ev);
          }}
          class="rounded-button data-highlighted:bg-muted flex items-center text-sm font-medium px-2 cursor-pointer"
        >
          <div class="grid place-items-center mr-2 size-8">
            {#if Icon}
              <Icon {...action.icon_props} />
            {/if}
          </div>
          <div class="flex flex-col">
            {action.label}
          </div>
        </DropdownMenu.Item>
      {/each}
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
