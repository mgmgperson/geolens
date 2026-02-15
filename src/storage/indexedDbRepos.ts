import type { MetaRepo, GameRepo, CountryAggRepo } from "./repo";
import { getDb } from "./db";
import type { CountryAgg, DbMeta, GameRecord, ISO2 } from "../core/schema";

export const metaRepo: MetaRepo = {
    async getMeta() {
        const db = await getDb();
        return db.get("meta", "meta");
    },
    async setMeta(meta: DbMeta) {
        const db = await getDb();
        await db.put("meta", meta);
    }
};

export const gameRepo: GameRepo = {
    async hasGame(token: string) {
        const db = await getDb();
        const v = await db.getKey("games", token);
        return v !== undefined;
    },
    async saveGame(game: GameRecord) {
        const db = await getDb();
        await db.put("games", game);
    },
    async getGame(token: string) {
        const db = await getDb();
        return db.get("games", token);
    }
};

export const countryAggRepo: CountryAggRepo = {
    async get(country: ISO2) {
        const db = await getDb();
        return db.get("countryAgg", country);
    },
    async upsert(agg: CountryAgg) {
        const db = await getDb();
        await db.put("countryAgg", agg);
    },
    async getAll() {
        const db = await getDb();
        return db.getAll("countryAgg");
    }
};
