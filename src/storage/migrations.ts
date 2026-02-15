import { DATA_VERSION, type DbMeta } from "../core/schema";
import { metaRepo } from "./indexedDbRepos";

export async function ensureDbInitialized(): Promise<void> {
    const now = Date.now();
    const meta = await metaRepo.getMeta();

    if (!meta) {
        const created: DbMeta = {
        id: "meta",
        dataVersion: DATA_VERSION,
        createdAtMs: now,
        updatedAtMs: now
        };
        await metaRepo.setMeta(created);
        return;
    }

    // TODO: handle real migrations later
    if (meta.dataVersion !== DATA_VERSION) {
        await metaRepo.setMeta({ ...meta, dataVersion: DATA_VERSION, updatedAtMs: now });
    }
}
