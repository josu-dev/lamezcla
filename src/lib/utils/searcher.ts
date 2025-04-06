export type SearchableItem<T extends Record<PropertyKey, any>> = {
    item: T;
    AID: number;
    searchable_text: string;
};

export type AnyRecord = Record<PropertyKey, any>;

export type OneOrMany<T> = T | T[];

export type ItemToSearchableText<T extends AnyRecord> = (item: T) => string;

/**
 * Translates a string into a representation that can be used for searching.
 *
 * This function will:
 * - Convert the string to lower case.
 * - Normalize the string using the Unicode Normalization Form D (NFD), which will decompose characters into their ASCII equivalents.
 * - Remove all characters that are not in the range of 0x21 to 0x7E (`!` to `~`), which are the most desirable characters for searching.
 *
 * @param text The text to translate.
 * @returns The source text translated to characters in the range of 0x21 to 0x7E (`!` to `~`).
 */
function utf_to_ascii(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[^\x21-\x7E]/g, '');
}

export const emptySearchMode = {
    all: 'all',
    none: 'none',
} as const;

type EmptySearchMode = (typeof emptySearchMode)[keyof typeof emptySearchMode];

export type SearcherOptions<T extends AnyRecord> = {
    mapper: ItemToSearchableText<T>;
    on_empty_search?: EmptySearchMode;
    search_on_update?: boolean;
};

export type ItemSelector<T extends AnyRecord> = (item: T, AID: number) => boolean;

export class Searcher<
    TSource extends AnyRecord,
    T extends SearchableItem<TSource> = SearchableItem<TSource>,
> {
    static #AID = 0;

    #items: T[];
    #items_filtered: T[];
    #query: string;
    #source_items: TSource[];
    #source_items_filtered: TSource[];
    #mapper: ItemToSearchableText<TSource>;
    #search_on_update: boolean;
    #empty_search_mode: EmptySearchMode;

    constructor({
        mapper,
        search_on_update,
        on_empty_search,
    }: SearcherOptions<TSource>) {
        this.#items = [];
        this.#items_filtered = [];
        this.#query = '';
        this.#source_items = [];
        this.#source_items_filtered = [];
        this.#mapper = mapper;
        this.#search_on_update = search_on_update ?? true;
        this.#empty_search_mode = on_empty_search ?? emptySearchMode.all;
    }

    #set(item: OneOrMany<TSource>, clear: boolean) {
        if (clear) {
            this.#source_items.length = 0;
            this.#items.length = 0;
        }

        const items = Array.isArray(item) ? item : [item];
        for (const item of items) {
            this.#source_items.push(item);
            this.#items.push({
                item,
                AID: Searcher.#AID++,
                searchable_text: utf_to_ascii(this.#mapper(item)),
            } as T);
        }

        if (this.#search_on_update) {
            this.search(this.#query);
        }
    }

    set(item: OneOrMany<TSource>): void {
        this.#set(item, true);
    }

    add(item: TSource | TSource[]): void {
        this.#set(item, false);
    }

    remove(selector: ItemSelector<TSource>): TSource[] {
        const removed_items: TSource[] = [];
        for (let i = this.#items.length - 1; i >= 0; i--) {
            const item = this.#items[i]!;
            if (selector(item.item, item.AID)) {
                this.#items.splice(i, 1);
                this.#source_items.splice(i, 1);
                removed_items.push(item.item);
            }
        }

        if (this.#search_on_update) {
            this.search(this.#query);
        }

        return removed_items;
    }

    search(query: string): TSource[] {
        const safe_query = utf_to_ascii(query);
        this.#query = safe_query;

        this.#items_filtered.length = 0;
        this.#source_items_filtered.length = 0;

        if (safe_query === '') {
            if (this.#empty_search_mode === emptySearchMode.none) {
                return [];
            }

            for (let i = 0; i < this.#items.length; i++) {
                const item = this.#items[i]!;
                this.#items_filtered.push(item);
                this.#source_items_filtered.push(item.item);
            }

            return [...this.#source_items];
        }

        for (let item_i = 0; item_i < this.#items.length; item_i++) {
            const item = this.#items[item_i]!;
            let qchar_i = 0;
            for (let ichar_i = 0; ichar_i < item.searchable_text.length; ichar_i++) {
                if (item.searchable_text[ichar_i] === safe_query[qchar_i]) {
                    qchar_i++;
                    if (qchar_i === safe_query.length) {
                        this.#items_filtered.push(item);
                        this.#source_items_filtered.push(item.item);
                        break;
                    }
                }
            }
        }

        return [...this.#source_items_filtered];
    }

    search_no_side_effect(query: string): TSource[] {
        const safe_query = utf_to_ascii(query);
        const out: TSource[] = [];

        if (safe_query === '') {
            if (this.#empty_search_mode === emptySearchMode.none) {
                return [];
            }

            return [...this.#source_items];
        }

        for (let item_i = 0; item_i < this.#items.length; item_i++) {
            const item = this.#items[item_i]!;
            let qchar_i = 0;
            for (let ichar_i = 0; ichar_i < item.searchable_text.length; ichar_i++) {
                if (item.searchable_text[ichar_i] === safe_query[qchar_i]) {
                    qchar_i++;
                    if (qchar_i === safe_query.length) {
                        out.push(item.item);
                        break;
                    }
                }
            }
        }

        return out;
    }

    reset({
        mapper,
        search_on_update: searchOnUpdate,
        on_empty_search: onEmptyQuery,
    }: Partial<SearcherOptions<TSource>>): void {
        this.#items.length = 0;
        this.#items_filtered.length = 0;
        this.#query = '';
        this.#source_items.length = 0;
        this.#source_items_filtered.length = 0;
        this.#mapper = mapper ?? this.#mapper;
        this.#search_on_update = searchOnUpdate ?? this.#search_on_update;
        this.#empty_search_mode = onEmptyQuery ?? this.#empty_search_mode;
    }

    sort(comparator: (a: T, b: T) => number): void {
        this.#items.sort(comparator);
        this.#source_items.length = 0;
        for (let i = 0; i < this.#items.length; i++) {
            this.#source_items.push(this.#items[i]!.item);
        }

        if (this.#search_on_update) {
            this.search(this.#query);
        }
    }
}
