export const SITE_NAME = "lamezcla";

export const DEFAULT_SEO = {
    icon: '/favicon.svg',
    // manifest: '/manifest.webmanifest',
    manifest: undefined,
    site_name: SITE_NAME,
    theme_color: '#f0b100',
    background_color: '#0a0a0a',
    title_default: SITE_NAME,
    title_template: '%s - ' + SITE_NAME,
    // image: {
    //     url: "/banner_og.webp",
    //     alt: "lamezcla Banner",
    //     width: "1200",
    //     height: "630",
    // },
    image: undefined,
    language_tag: 'en'
} as const;
