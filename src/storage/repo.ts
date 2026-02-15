import type { CountryAgg, GameRecord, ISO2, DbMeta } from "../core/schema";

export interface MetaRepo {
    getMeta(): Promise<DbMeta | undefined>;
    setMeta(meta: DbMeta): Promise<void>;
}

export interface GameRepo {
    hasGame(token: string): Promise<boolean>;
    saveGame(game: GameRecord): Promise<void>;
    getGame(token: string): Promise<GameRecord | undefined>;
}

export interface CountryAggRepo {
    get(country: ISO2): Promise<CountryAgg | undefined>;
    upsert(agg: CountryAgg): Promise<void>;
    getAll(): Promise<CountryAgg[]>;
}