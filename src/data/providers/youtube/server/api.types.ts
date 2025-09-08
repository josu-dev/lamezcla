// Types recreated from https://developers.google.com/youtube/v3/docs

export type StringId = string;

export type StringNumber = `${number}`;

export type StringDate = string;

export type PageInfo = { totalResults: number, resultsPerPage: number; };

export type ResponseBuilder<Kind extends `youtube#${string}`, Item> = {
    kind: Kind;
    etag: StringId;
    nextPageToken?: string;
    prevPageToken?: string;
    pageInfo: PageInfo;
    items: Item[];
};

export type Thumbnail = {
    url: string;
    width: number;
    height: number;
};

export type ExtractPartParam<T extends Record<string, any>, Keys = keyof Omit<T, 'kind' | 'etag' | 'id'>> = [Keys, ...Keys[]];

export type ParamFromItems<T> = T extends { items: any[]; } ? ExtractPartParam<T['items'][number]> : never;

export type AnyResponse = ResponseBuilder<any, any>;

export type FetchApiOptions<R, E = string> = {
    endpoint: E;
    part: ParamFromItems<R>;
    others?: Record<string, string>;
};

export type FetchApiResponse<B extends AnyResponse, P extends ParamFromItems<B>> = Omit<B, 'items'> & { items: Pick<B['items'][number], P[number]>[]; };

export type Localizations = Record<string, {
    title: string;
    description: string;
}>;

export type Localized = {
    title: string;
    description: string;
};

export type TopicsDetails = {
    topicCategories: string[];
};

export type PrivacyStatus = 'private' | 'public' | 'unlisted';

export type ThumbnailsDMH = {
    /**
     * The default thumbnail for a video – or a resource that refers to a video, such as a playlist item or search result – is 120px wide and 90px tall. The default thumbnail for a channel is 88px wide and 88px tall.
     */
    default: Thumbnail;
    /**
     * For a video (or a resource that refers to a video), this image is 320px wide and 180px tall. For a channel, this image is 240px wide and 240px tall.
     */
    medium: Thumbnail;
    /**
     * For a video (or a resource that refers to a video), this image is 480px wide and 360px tall. For a channel, this image is 800px wide and 800px tall.
     */
    high: Thumbnail;
};

export type ThumbnailsDMHSM = ThumbnailsDMH & {
    /**
     * This image is available for some videos and other resources that refer to videos, like playlist items or search results. This image is 640px wide and 480px tall.
     */
    standard: Thumbnail;
    /**
     * The highest resolution version of the thumbnail image. This image size is available for some videos and other resources that refer to videos, like playlist items or search results. This image is 1280px wide and 720px tall.
     */
    maxres: Thumbnail;
};

export type Channel = {
    kind: 'youtube#channel';
    etag: StringId;
    id: StringId;
    snippet: {
        title: string;
        description: string;
        customUrl: string;
        publishedAt: StringDate;
        thumbnails?: ThumbnailsDMH;
        localized: Localized;
        defaultLanguage?: string;
        country?: string;
    };
    contentDetails: {
        relatedPlaylists: { likes: string, uploads: StringId; };
    };
    statistics: {
        viewCount: StringNumber;
        subscriberCount: StringNumber;
        hiddenSubscriberCount: boolean;
        videoCount: StringNumber;
    };
    topicDetails: TopicsDetails;
    status: {
        privacyStatus: PrivacyStatus;
        isLinked: boolean;
        longUploadsStatus: string;
        madeForKids: boolean;
        selfDeclaredMadeForKids: boolean;
    };
    brandingSettings: {
        channel: {
            title: string;
            description: string;
            keywords: string;
            trackingAnalyticsAccountId: string;
            unsubscribedTrailer: string;
            defaultLanguage: string;
            country: string;
        };
        watch: {
            textColor: string;
            backgroundColor: string;
            featuredPlaylistId: string;
        };
    };
    auditDetails: {
        overallGoodStanding: boolean;
        communityGuidelinesGoodStanding: boolean;
        copyrightStrikesGoodStanding: boolean;
        contentIdClaimsGoodStanding: boolean;
    };
    contentOwnerDetails: {
        contentOwner: string;
        timeLinked: StringDate;
    };
    localizations: Localizations;
};

export type ChannelListResponse = ResponseBuilder<
    'youtube#channelListResponse', Channel
>;

export type PlaylistPodcastStatus = 'enabled' | 'disabled' | 'unspecified';

export type Playlist = {
    kind: "youtube#playlist";
    etag: StringId;
    id: StringId;
    snippet: {
        publishedAt: StringDate;
        channelId: StringId;
        title: string;
        description: string;
        thumbnails?: ThumbnailsDMHSM;
        channelTitle: string;
        defaultLanguage?: string;
        localized: Localized;
    };
    status: {
        privacyStatus: PrivacyStatus;
        podcastStatus: PlaylistPodcastStatus;
    };
    contentDetails: {
        itemCount: number;
    };
    player: {
        embedHtml: string;
    };
    localizations: Localizations;
};

export type PlaylistListResponse = ResponseBuilder<
    "youtube#playlistListResponse", Playlist
>;

type ResourceId = (
    {
        kind: "youtube#video";
        videoId: StringId;
    } |
    {
        kind: "youtube#playlist";
        playlistId: StringId;
    } |
    {
        kind: "youtube#channel";
        channelId: StringId;
    }
);

export type PlaylistItem = {
    kind: "youtube#playlistItem";
    etag: StringId;
    id: StringId;
    snippet: {
        publishedAt: StringDate;
        channelId: StringId;
        title: string;
        description: string;
        thumbnails?: ThumbnailsDMHSM;
        channelTitle: string;
        videoOwnerChannelTitle: string;
        videoOwnerChannelId: StringId;
        playlistId: StringId;
        position: number;
        resourceId: ResourceId;
    };
    contentDetails: {
        videoId: StringId;
        note?: string;
        videoPublishedAt: StringDate;
    };
    status: {
        privacyStatus: PrivacyStatus;
    };
};

export type PlaylistItemListResponse = ResponseBuilder<
    "youtube#playlistItemListResponse", PlaylistItem
>;

export type Video = {
    kind: "youtube#video";
    etag: StringId;
    id: string;
    snippet: {
        publishedAt: StringDate;
        channelId: string;
        title: string;
        description: string;
        thumbnails?: ThumbnailsDMHSM;
        channelTitle: string;
        tags: string[];
        categoryId: string;
        liveBroadcastContent: string;
        defaultLanguage: string;
        localized: Localized;
        defaultAudioLanguage: string;
    };
    contentDetails: {
        duration: string;
        dimension: string;
        definition: string;
        caption: string;
        licensedContent: boolean;
        regionRestriction: {
            allowed: string[];
            blocked: string[];
        };
        projection: string;
        hasCustomThumbnail: boolean;
    };
    status: {
        uploadStatus: 'deleted' | 'failed' | 'processed' | 'rejected' | 'uploaded';
        failureReason: string;
        rejectionReason: string;
        privacyStatus: string;
        publishAt: StringDate;
        license: string;
        embeddable: boolean;
        publicStatsViewable: boolean;
        madeForKids: boolean;
        selfDeclaredMadeForKids: boolean;
        containsSyntheticMedia: boolean;
    };
    statistics: {
        viewCount: string;
        likeCount: string;
        dislikeCount: string;
        favoriteCount: string;
        commentCount: string;
    };
    paidProductPlacementDetails: {
        hasPaidProductPlacement: boolean;
    };
    player: {
        embedHtml: string;
        embedHeight?: number;
        embedWidth?: number;
    };
    topicDetails: {
        topicCategories: string[];
    };
    recordingDetails: {
        recordingDate: StringDate;
    };
    fileDetails: {
        fileName: string;
        fileSize: number;
        fileType: string;
        container: string;
        videoStreams: {
            widthPixels: number;
            heightPixels: number;
            frameRateFps: number;
            aspectRatio: number;
            codec: string;
            bitrateBps: number;
            rotation: string;
            vendor: string;
        }[];
        audioStreams: {
            channelCount: number;
            codec: string;
            bitrateBps: number;
            vendor: string;
        }[];
        durationMs: number;
        bitrateBps: number;
        creationTime: string;
    };
    processingDetails: {
        processingStatus: string;
        processingProgress: {
            partsTotal: number;
            partsProcessed: number;
            timeLeftMs: number;
        };
        processingFailureReason: string;
        fileDetailsAvailability: string;
        processingIssuesAvailability: string;
        tagSuggestionsAvailability: string;
        editorSuggestionsAvailability: string;
        thumbnailsAvailability: string;
    };
    suggestions: {
        processingErrors: string[];
        processingWarnings: string[];
        processingHints: string[];
        tagSuggestions: {
            tag: string;
            categoryRestricts: string[];
        }[];
        editorSuggestions: string[];
    };
    liveStreamingDetails: {
        actualStartTime: StringDate;
        actualEndTime: StringDate;
        scheduledStartTime: StringDate;
        scheduledEndTime: StringDate;
        concurrentViewers: number;
        activeLiveChatId: string;
    },
    localizations: Localizations;
};

export type VideoListResponse = ResponseBuilder<
    "youtube#videoListResponse", Video
>;
