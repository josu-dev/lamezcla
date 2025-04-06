export function channel_url(id: string) {
    return `https://www.youtube.com/channel/${id}`;
}

export function playlist_url(id: string) {
    return `https://www.youtube.com/playlist?list=${id}`;
}

export function video_url(id: string) {
    return `https://www.youtube.com/watch?v=${id}`;
}
