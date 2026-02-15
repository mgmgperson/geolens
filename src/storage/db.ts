import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { CountryAgg, DbMeta, GameRecord } from "../core/schema";

const DB_NAME = "geolens";
const DB_VERSION = 1;

interface GeoLensDB extends DBSchema {
    meta: {
        key: DbMeta["id"];
        value: DbMeta;
    };
    games: {
        key: GameRecord["gameToken"];
        value: GameRecord;
    };
    countryAgg: {
        key: CountryAgg["country"];
        value: CountryAgg;
    };
}

let dbPromise: Promise<IDBPDatabase<GeoLensDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<GeoLensDB>> {
    if (!dbPromise) {
        dbPromise = openDB<GeoLensDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains("meta")) {
            db.createObjectStore("meta", { keyPath: "id" });
            }
            if (!db.objectStoreNames.contains("games")) {
            db.createObjectStore("games", { keyPath: "gameToken" });
            }
            if (!db.objectStoreNames.contains("countryAgg")) {
            db.createObjectStore("countryAgg", { keyPath: "country" });
            }
        }
        });
    }
    return dbPromise;
}
