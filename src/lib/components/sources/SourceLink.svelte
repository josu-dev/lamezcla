<script lang="ts">
  import * as Icon from "$lib/components/icons.js";
  import { channel_url, playlist_url, video_url } from "./shared.js";

  type SourceType = "channel" | "playlist" | "video";

  type Props = {
    type: SourceType;
    id: string;
    title: string;
    size: string;
  };

  let { type, id, title, size }: Props = $props();

  const href_map: Record<SourceType, (id: string) => string> = {
    channel(id) {
      return channel_url(id);
    },
    playlist(id) {
      return playlist_url(id);
    },
    video(id) {
      return video_url(id);
    },
  };

  let href = $derived(href_map[type](id));
  let text = $derived(`Open ${title} ${type}`);
</script>

<a {href} target="_blank" rel="noopener noreferrer" title={text} class="">
  <span class="sr-only">{text}</span>
  <Icon.ExternalLink class="inline-block size-5 align-top" />
</a>
