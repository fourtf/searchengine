import SpotifyWebApi from 'spotify-web-api-node';

// MAKE CLIENT
const canUseSpotify = process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET;

if (!canUseSpotify) {
    console.error("SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not set");
}

const sp = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// ACCESS TOKEN
let lastExecution: null | number = null;
const cooldown = 1000 * 60 * 30; // 30 Minutes

/**
 * Refreshes spotify token if needed.
 */
async function refreshAccessToken(): Promise<void> {
    if (lastExecution === null || Date.now() - lastExecution > cooldown) {
        lastExecution = Date.now();
        await sp.clientCredentialsGrant().then(
            (data) => {
                sp.setAccessToken(data.body.access_token);
                console.log('access token refreshed');
            },
            console.error
        );
    }
}

// FUNCTION
export async function getCoverUrls(songIds: string[]): Promise<{ [id: string]: string | undefined } | null> {
    if (!canUseSpotify) {
        return null;
    }

    await refreshAccessToken();
    const data = await sp.getTracks(songIds);

    return Object.fromEntries(data.body.tracks.map(({ id, album: { images } }) => {
        return [id, images.find(img => img.height === 300)?.url ?? images?.[0]?.url ?? null];
    }));
}

// SERVER
// const server = fastify()

// server.get('/cover', async (request, reply) => {
//     const query = request.query;
//     assertIsRecord(query);
//     const { song_id } = query;
//     assertIsStringOrStringArray(song_id);

//     const songIds = Array.isArray(song_id) ? song_id : [song_id];
//     const url = await getSongCoverUrls(songIds);

//     reply.code(200).send({ url });
// })

// server.listen(3334, (err, address) => {
//     if (err) {
//         console.error(err)
//         process.exit(1)
//     }
//     console.log(`Server listening at ${address}`)
// })
