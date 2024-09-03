export const RACETIME = "https://racetime.gg";

export type UserData = {
    id: string;
    full_name: string;
    name: string;
    discriminator: string;
    url: string;
    avatar: string;
    pronouns: string;
    flair: string;
    twitch_name: string;
    twitch_display_name: string;
    twitch_channel: string;
    can_moderate: boolean;
};

export enum EntrantStatus {
    Done = "done",
    DNF = "dnf",
}

export type RaceData = {
    name: string;
    status: {
        value: string;
        // verbose: string,
        // help_text: string,
    };
    goal: {
        name: string;
        custom: boolean;
    };
    info: string;
    entrants_count: number;
    // entrants_count_finished: number,
    // entrants_count_inactive: number,
    // opened_at: string,
    ended_at: string;
    recorded: boolean;
    entrants: Array<{
        user: UserData;
        status: {
            value: EntrantStatus;
        };
        finish_time: string;
        place: number;
        comment: string;
    }>;
};

type RaceListData = {
    count: number;
    num_pages: number;
    races: Array<RaceData>;
};

export type SlugData = {
    name: string;
    short_name: string;
    slug: string;
    url: string;
    data_url: string;
    image: string;
    info: string;
    streaming_required: boolean;
    owners: Array<UserData>;
    moderators: Array<UserData>;
    goals: Array<string>;
    current_races: Array<RaceData>;
    emotes: Map<string, string>;
};

export async function numPagesForGame(slug: string): Promise<number> {
    return (await getRaces(slug)).num_pages;
}

export async function getRaces(
    slug: string,
    page: number = 1,
    show_entrants: boolean = false
): Promise<RaceListData> {
    const pageData = await fetch(
        `${RACETIME}/${slug}/races/data?show_entrants=${show_entrants}&page=${page}`
    );
    return pageData.json();
}

export async function getAllRaces(
    slug: string,
    date?: string,
    recorded_only: boolean = false,
    goal?: string
): Promise<Array<RaceData>> {
    const numPages = await numPagesForGame(slug);
    const raceArray: Array<RaceData> = [];
    const cutoff = date === undefined ? 0 : Date.parse(date);
    for (let i = 1; i <= numPages; i++) {
        for (const race of (await getRaces(slug, i, true)).races) {
            if (Date.parse(race.ended_at) < cutoff) {
                return raceArray;
            }
            if (
                (!recorded_only || race.recorded) &&
                (goal === undefined || race.goal.name === goal)
            ) {
                raceArray.push(race);
            }
        }
    }
    return raceArray;
}

export async function getSlugData(slug: string): Promise<SlugData> {
    const dat = await fetch(`${RACETIME}/${slug}/data`);
    return dat.json();
}

export async function getRecordableGoals(slug: string): Promise<Array<string>> {
    return (await getSlugData(slug)).goals;
}

export async function isValidSlug(slug: string): Promise<boolean> {
    try {
        const dat = await fetch(`${RACETIME}/${slug}/data`);
        if (dat.status === 404) return false;
        return true;
    } catch {
        // A network error will be thrown if the slug is invalid
        return false;
    }
}
