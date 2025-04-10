export type QueryMode = "" | "c" | "ch" | "pl" | "v";

export type Query = {
    raw: string;
    mode: QueryMode;
    value: string;
};

const ytlink_re =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?.*v=(?<v_id1>[\w-]+)(?:.*&list=(?<pl_id1>[\w-]+))?|playlist\?.*list=(?<pl_id2>[\w-]+)|(?<handle>@[\w-]+)|channel\/(?<c_id1>[\w-]+))|youtu\.be\/(?<v_id2>[\w-]+))/i;

export function parse_query(v: string): Query {
    if (v.startsWith("@")) {
        return {
            raw: v,
            mode: "ch",
            value: v,
        };
    }

    if (v.length < 20) {
        return {
            raw: v,
            mode: "",
            value: "",
        };
    }

    const r = ytlink_re.exec(v);
    if (r === null) {
        return {
            raw: v,
            mode: "",
            value: "",
        };
    }

    let mode: QueryMode = "";
    let value = "";
    const groups = r.groups!;
    const video_id = groups.v_id1 ?? groups.v_id2;
    const playlist_id = groups.pl_id1 ?? groups.pl_id2;
    const handle = groups.handle;
    const channel_id = groups.c_id1;
    if (video_id?.length) {
        mode = "v";
        value = video_id;
    }
    if (playlist_id?.length) {
        mode = "pl";
        value = playlist_id;
    } else if (handle?.length) {
        mode = "ch";
        value = handle;
    } else if (channel_id?.length) {
        mode = "c";
        value = channel_id;
    }

    return {
        raw: v,
        mode: mode,
        value: value,
    };
}
