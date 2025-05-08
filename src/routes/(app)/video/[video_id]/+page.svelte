<script lang="ts">
  import { use_pinned_ctx } from "$client/context/index.js";
  import HumanTime from "$lib/components/HumanTime.svelte";
  import { Icon } from "$lib/components/icons/index.js";
  import { ActionsMenu } from "$lib/components/menus/index.js";
  import { Metadata, PageSimple } from "$lib/components/site/index.js";
  import SourceLink from "$lib/components/sources/SourceLink.svelte";
  import { seconds_to_ddhhmmss, uuidv4 } from "$lib/utils/index.js";
  import type { PageData } from "./$types.js";

  type Props = {
    data: PageData;
  };

  let { data }: Props = $props();

  const pinned_state = use_pinned_ctx();

  let data_video = $derived(data.video);
  const video_is_pinned = $derived(pinned_state.is_pinned(data_video.id));
</script>

<Metadata description="Just have a look at some details of '{data_video.title}' video." />

<PageSimple.Root>
  <PageSimple.Header>
    {#snippet image()}
      <PageSimple.HeaderImage img={data_video.img} alt="{data_video.title} video thumbnail">
        {#snippet children(image)}
          <a href="/play?v={data_video.id}" class="group relative">
            {@render image()}
            <div
              class="absolute grid opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity place-items-center inset-0 bg-background/75"
            >
              <div class="flex items-center gap-2 text-lg font-bold">
                <Icon.Play class="size-5 stroke-3" /> Play
              </div>
            </div>
          </a>
        {/snippet}
      </PageSimple.HeaderImage>
    {/snippet}
    {#snippet title()}
      {data_video.title}
      <SourceLink type="video" id={data_video.id} title={data_video.title} size="size-5" />
    {/snippet}
    {#snippet children()}
      <div class="font-bold text-foreground text-base">
        <a href="/{data_video.channel_id}">{data_video.channel_title}</a>
      </div>
      Uploaded <HumanTime utc={data_video.published_at} as_relative />
    {/snippet}
    {#snippet actions()}
      <ActionsMenu
        actions={[
          {
            id: uuidv4(),
            label: video_is_pinned ? "Unpin" : "Pin",
            action: () => {
              if (video_is_pinned) {
                pinned_state.unpin_by_id(data_video.id);
              } else {
                pinned_state.pin("video", data_video);
              }
            },
            icon: video_is_pinned ? Icon.PinOff : Icon.Pin,
          },
        ]}
      />{/snippet}
  </PageSimple.Header>

  <PageSimple.Content>
    {#snippet title()}
      {#if data_video.is_available}
        Video details
      {:else}
        <span class="text-4xl font-normal">
          Video <span class="font-bold text-red-500">UNAVAILABLE</span>
        </span>
      {/if}
    {/snippet}
    {#snippet children()}
      {#if data_video.is_available}
        <div class="flex gap-4 px-4 py-2 w-full">
          <div class="flex flex-col gap-2 justify-around py-2">
            <div class="flex">
              <h3 class="text-base font-bold">{data_video.title}</h3>
            </div>
            <div class="text-foreground/80 space-y-1 [&_p>span]:font-semibold">
              <p>
                <span>Channel:</span>
                <a href="/{data_video.channel_id}" rel="noopener noreferrer" data-no-play class="hover:text-foreground">
                  {data_video.channel_title}
                </a>
              </p>
              <p>
                <span>Duration:</span>
                {seconds_to_ddhhmmss(data_video.total_seconds)}
              </p>
              <p>
                <span>Published:</span>
                <HumanTime utc={data_video.published_at} />
              </p>
              <p>
                <span>Visibility:</span>
                {data_video.is_public ? "Public" : data_video.is_unlisted ? "Unlisted" : "Private"}
              </p>
            </div>
          </div>
          <div class="flex items-center ml-auto" data-no-play></div>
        </div>
      {/if}
    {/snippet}
  </PageSimple.Content>
</PageSimple.Root>
