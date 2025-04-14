<script lang="ts">
  import { use_pinned_ctx } from "$client/context/index.js";
  import HumanTime from "$lib/components/HumanTime.svelte";
  import { Icon } from "$lib/components/icons/index.js";
  import { ActionsMenu } from "$lib/components/menus/index.js";
  import * as PageSimple from "$lib/components/page/PageSimple/index.js";
  import { channel_url } from "$lib/components/sources/shared.js";
  import SourceLink from "$lib/components/sources/SourceLink.svelte";
  import { seconds_to_ddhhmmss, uuid } from "$lib/utils/index.js";
  import type { PageData } from "./$types.js";

  type Props = {
    data: PageData;
  };

  let { data }: Props = $props();

  const pinned_state = use_pinned_ctx();

  let video = $derived(data.video);
  let video_is_pinned = $derived(pinned_state.is_pinned(video.id));
</script>

<PageSimple.Root>
  <PageSimple.Header>
    {#snippet image()}
      <PageSimple.HeaderImage img={video.img} alt="{video.title} video thumbnail" />
    {/snippet}
    {#snippet title()}
      {video.title}
      <SourceLink type="video" id={video.id} title={video.title} size="size-5" />
    {/snippet}
    {#snippet children()}
      Uploaded <HumanTime utc={video.published_at} as_relative />
    {/snippet}
    {#snippet actions()}
      <ActionsMenu
        actions={[
          {
            id: uuid(),
            label: video_is_pinned ? "Unpin" : "Pin",
            action: () => {
              if (video_is_pinned) {
                pinned_state.unpin_by_id(video.id);
              } else {
                pinned_state.pin("video", video);
              }
            },
            icon: video_is_pinned ? Icon.PinOff : Icon.Pin,
          },
        ]}
      />{/snippet}
  </PageSimple.Header>

  <PageSimple.Content>
    {#snippet title()}
      {#if video.is_available}
        Video details
      {:else}
        <span class="text-4xl font-normal">
          Video <span class="font-bold text-red-500">UNAVAILABLE</span>
        </span>
      {/if}
    {/snippet}
    {#snippet children()}
      {#if video.is_available}
        <div class="flex gap-4 px-4 py-2 w-full">
          <a href="/play?v={video.id}" class="relative group">
            <img
              src={video.img?.url}
              width={video.img?.width}
              height={video.img?.height}
              alt="{video.title} video thumbnail"
              class="rounded-md w-full aspect-video object-fill"
            />
            <div
              class="absolute grid opacity-0 [&:is(:where(.group):hover:not(:has([data-no-play]:hover))_*)]:opacity-100 transition-opacity place-items-center inset-0 bg-background/75"
            >
              <div class="flex items-center gap-2 text-2xl font-bold">
                <Icon.Play class="size-8 stroke-3" /> Play
              </div>
            </div>
          </a>
          <div class="flex flex-col gap-2 justify-around py-2">
            <div class="flex">
              <h3 class="text-base font-bold">{video.title}</h3>
            </div>
            <div class="text-foreground/80 space-y-1 [&_p>span]:font-semibold">
              <p>
                <span>Channel:</span>
                <a href="/{video.channel_id}" rel="noopener noreferrer" data-no-play class="hover:text-foreground">
                  {video.channel_title}
                </a>
                <a
                  href={channel_url(video.channel_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-no-play
                  class="hover:text-foreground"
                >
                  <span class="sr-only">
                    {video.channel_title}
                  </span>
                  <Icon.ExternalLink class="align-top size-4 inline-flex" />
                </a>
              </p>
              <p>
                <span>Duration:</span>
                {seconds_to_ddhhmmss(video.total_seconds)}
              </p>
              <p>
                <span>Published:</span>
                <HumanTime utc={video.published_at} />
              </p>
              <p>
                <span>Visibility:</span>
                {video.is_public ? "Public" : video.is_unlisted ? "Unlisted" : "Private"}
              </p>
            </div>
          </div>
          <div class="flex items-center ml-auto" data-no-play></div>
        </div>
      {/if}
    {/snippet}
  </PageSimple.Content>
</PageSimple.Root>
