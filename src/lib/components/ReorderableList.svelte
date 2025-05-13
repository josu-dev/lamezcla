<script lang="ts" generics="Item extends {id: string}">
  import type { Snippet } from "svelte";
  import { type DndEvent, dndzone, SOURCES, TRIGGERS } from "svelte-dnd-action";
  import { flip } from "svelte/animate";
  import type { HTMLOlAttributes } from "svelte/elements";
  import { longpress } from "./longpress.js";

  type Props = {
    dnd_zone: string;
    items: Item[];
    item: Snippet<[item: Item, i: number]>;
    item_empty?: Snippet<[]>;
    on_reorder: (items: Item[]) => void;
    flip_duration?: number;
  } & HTMLOlAttributes;

  let { dnd_zone, items, item, item_empty, on_reorder, class: classes = "", flip_duration = 150 }: Props = $props();

  let current_items = $derived(items);
  let is_drag_disabled = $state(true);

  type GenericDndEvent = CustomEvent<DndEvent<Item>>;

  function dnd_onconsider(e: GenericDndEvent) {
    current_items = e.detail.items;

    if (e.detail.info.source === SOURCES.KEYBOARD && e.detail.info.trigger === TRIGGERS.DRAG_STOPPED) {
      is_drag_disabled = true;
    }
  }

  function dnd_onfinalized(e: GenericDndEvent) {
    current_items = e.detail.items;
    on_reorder($state.snapshot(e.detail.items) as Item[]);

    if (e.detail.info.source === SOURCES.POINTER) {
      is_drag_disabled = true;
    }
  }

  function dnd_transform_dragged_element(el?: HTMLElement) {
    if (el == null) {
      return;
    }
    el.dataset.isDragging = "true";
  }

  function item_on_long_press() {
    is_drag_disabled = false;
  }
</script>

<ol
  use:dndzone={{
    items: current_items,
    flipDurationMs: flip_duration,
    dragDisabled: is_drag_disabled,
    type: dnd_zone,
    transformDraggedElement: dnd_transform_dragged_element,
    dropTargetStyle: {},
  }}
  onconsider={dnd_onconsider as any}
  onfinalize={dnd_onfinalized as any}
  class={classes}
>
  {#each current_items as p, i (p.id)}
    <li animate:flip={{ duration: flip_duration }} use:longpress onlongpress={item_on_long_press}>
      {@render item(p, i)}
    </li>
  {:else}
    <li>
      {@render item_empty?.()}
    </li>
  {/each}
</ol>
