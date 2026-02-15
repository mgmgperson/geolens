export type GeoGuessrGameV3 = any;

/**
 * Fetches the game data for a classic Geoguessr game given its token. This is used to retrieve the details of a game after detecting the token from the URL.
 * @param token The unique token identifying the Geoguessr game to fetch.
 * @returns A promise that resolves to the game data in the GeoGuessrGameV3 format.
 * @throws An error if the fetch request fails or if the response is not OK.
 */
export async function fetchClassicGame(token: string): Promise<GeoGuessrGameV3> {
    const url = `https://www.geoguessr.com/api/v3/games/${token}`;
    const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: { "Accept": "application/json" },
    });
    if (!res.ok) throw new Error(`fetchClassicGame failed: ${res.status}`);
    return await res.json();
}
