// src/layers/allanime.ts
import axios from 'axios';
import { fetchWithRetry, handleCaptchaOrChallenge } from '../lib/scraperUtils'; // Use utils

const ALLANIME_API_BASE = 'https://api.allanime.day/api'; // Define base URL

// Function to search for anime using AllAnime API
async function fetchFromAllAnime(title: string) {
  const timestamp = new Date().toISOString();
  // Use a more specific search endpoint if available, otherwise use generic query
  // This GraphQL-like structure is an example and might need adjustment based on the current API
  const variables = { "search": { "query": title, "limit": 5 }, "translationType": "sub" };
  const query = `query($search:SearchInput){shows(search:$search){edges{_id,name,availableEpisodesDetail{sub,dub},thumbnail}}}`;
  const searchUrl = `${ALLANIME_API_BASE}?variables=${encodeURIComponent(JSON.stringify(variables))}&query=${encodeURIComponent(query)}`;
  console.log(`[AllAnime Layer] [${timestamp}] Searching: ${searchUrl}`);

  try {
    // Use fetchWithRetry for API calls, providing headers
    const responseData = await fetchWithRetry(searchUrl, {
        method: 'GET', // Explicitly set method
        headers: {
            'Accept': 'application/json',
            // Add Referer if needed: 'Referer': 'https://allanime.to/'
            // 'User-Agent' is handled by fetchWithRetry
        }
    });

    // Optional: Check for CAPTCHA/Challenge (less likely for direct API calls, but possible)
    // if (typeof responseData === 'string') { // Check if raw HTML was returned instead of JSON
    //    const challengeFreeData = await handleCaptchaOrChallenge(responseData, searchUrl);
    //    if (!challengeFreeData) {
    //        console.warn(`[AllAnime Layer] [${timestamp}] CAPTCHA/Challenge detected on API endpoint ${searchUrl}, returning null.`);
    //        return null;
    //    }
    //     responseData = JSON.parse(challengeFreeData); // Parse if challenge was bypassed
    // }


    // --- Process AllAnime API Response ---
    // Adjust based on the ACTUAL structure returned by AllAnime's API
    if (responseData?.data?.shows?.edges && responseData.data.shows.edges.length > 0) {
        const firstResult = responseData.data.shows.edges[0];
        if (firstResult?._id && firstResult?.name) {
             const animeData = {
                id: firstResult._id, // Use the AllAnime specific ID
                title: firstResult.name,
                thumbnail: firstResult.thumbnail, // Use thumbnail if available
                episodesDetail: firstResult.availableEpisodesDetail,
                // Construct a link to the AllAnime page if possible (might need title slugification)
                link: `https://allanime.to/anime/${firstResult._id}`, // Example link structure
            };
            console.log(`[AllAnime Layer] [${timestamp}] Found: "${animeData.title}" (ID: ${animeData.id})`);
            return animeData; // Return structured data
        }
    }

    console.warn(`[AllAnime Layer] [${timestamp}] No valid results found in API response for "${title}" at ${searchUrl}`);
    throw new Error('AllAnime no valid result in API response.');

  } catch (err: any) {
    const error = err as Error;
    const statusCode = (error as any).response?.status;
    const errorCode = (error as any).code;
    console.error(`[AllAnime Layer] [${timestamp}] Search failed for "${title}" at ${searchUrl}. Status: ${statusCode ?? 'N/A'}, Code: ${errorCode ?? 'N/A'}, Error: ${error.message}`);
    // console.error(`[AllAnime Layer] Error Stack: ${error.stack}`);
    return null; // Return null on failure
  }
}

// Function to fetch episodes from AllAnime API
async function fetchEpisodesFromAllAnime(animeData: { id: string, title: string }) {
    const timestamp = new Date().toISOString();
    if (!animeData || !animeData.id || !animeData.title) {
        console.error(`[AllAnime Layer] [${timestamp}] Invalid anime data provided to fetchEpisodes:`, animeData);
        throw new Error('Invalid anime data provided.');
    }

    const animeId = animeData.id; // AllAnime's internal ID
    // Construct the episode fetch URL based on AllAnime's API structure
    const variables = { "_id": animeId };
    const query = `query($id:String!){show(_id:$id){availableEpisodesDetail{sub,dub}}}`;
    const episodesApiUrl = `${ALLANIME_API_BASE}?variables=${encodeURIComponent(JSON.stringify(variables))}&query=${encodeURIComponent(query)}`; // Example query to get episode counts first

    console.log(`[AllAnime Layer] [${timestamp}] Fetching episode details from: ${episodesApiUrl}`);

    try {
        const episodeDetailsResponse = await fetchWithRetry(episodesApiUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });


        // --- Process Episode Details ---
        const subEpisodesCount = episodeDetailsResponse?.data?.show?.availableEpisodesDetail?.sub?.length || 0;
        // const dubEpisodesCount = episodeDetailsResponse?.data?.show?.availableEpisodesDetail?.dub?.length || 0;

        if (subEpisodesCount === 0) {
            console.warn(`[AllAnime Layer] [${timestamp}] No 'sub' episodes listed in details for "${animeData.title}" (ID: ${animeId})`);
            return null; // Or return empty array?
        }

        console.log(`[AllAnime Layer] [${timestamp}] Found ${subEpisodesCount} potential 'sub' episodes for "${animeData.title}". Fetching stream info...`);

        // --- Fetch Actual Episode Stream Info (Might need another query) ---
        // AllAnime often requires a separate query to get stream links for each episode number
        // This part is complex and highly specific to their API.
        // Placeholder: Assume we fetch links one by one or via a batch query if available.
        // We will simulate returning basic episode info for now.

        const episodes = [];
        for (let i = 1; i <= subEpisodesCount; i++) {
             // In a real scenario, you'd likely make another API call here
             // to get the specific stream link/player URL for episode `i`.
             // const streamInfo = await fetchStreamInfoForAllAnime(animeId, i, 'sub');
            const uniqueEpisodeId = `${animeData.title.replace(/[^a-zA-Z0-9]/g, '-')}-ep-${i}`;

            episodes.push({
                id: uniqueEpisodeId, // Generated ID
                number: i,
                title: `Episode ${i}`, // Title often not available in list
                // Link might be constructed or fetched from streamInfo
                link: `https://allanime.to/anime/${animeId}/episodes/sub/${i}`, // Example constructed link
            });
        }

        console.log(`[AllAnime Layer] [${timestamp}] Generated ${episodes.length} episode entries for "${animeData.title}"`);
        return episodes;

    } catch (err: any) {
        const error = err as Error;
        const statusCode = (error as any).response?.status;
        const errorCode = (error as any).code;
        console.error(`[AllAnime Layer] [${timestamp}] Failed to fetch episodes for "${animeData?.title}" (ID: ${animeId}). Status: ${statusCode ?? 'N/A'}, Code: ${errorCode ?? 'N/A'}, Error: ${error.message}`);
        // console.error(`[AllAnime Layer] Error Stack: ${error.stack}`);
        return null; // Return null on failure
    }
}

// Function to fetch streaming links (placeholder, highly dependent on AllAnime API)
async function fetchStreamingLinksFromAllAnime(episodeData: { id: string, link: string, number?: string | number }) {
    const timestamp = new Date().toISOString();
     if (!episodeData || !episodeData.link || !episodeData.number || !episodeData.id) {
        console.error(`[AllAnime Layer] [${timestamp}] Invalid episode data provided to fetchStreamingLinks:`, episodeData);
        throw new Error('Invalid episode data provided.');
    }

    const episodeNumber = episodeData.number;
    // Extract animeId from the generated episode ID if needed
    // const animeIdMatch = episodeData.id.match(/^(.*)-ep-\d+$/);
    // const animeIdFromName = animeIdMatch ? animeIdMatch[1].replace(/-/g, ' ') : null; // Might not be the actual ID

    // TODO: This part requires understanding how AllAnime provides stream links.
    // It likely involves another API call with the anime ID and episode number.
    // Example hypothetical call:
    // const streamApiUrl = `${ALLANIME_API_BASE}/getStream?animeId=${animeId}&episode=${episodeNumber}&type=sub`;
    // This often requires specific headers or tokens.
    const streamApiUrl = `https://allanime.to/player/${episodeData.id}?episode=${episodeNumber}` // Placeholder using constructed link

    console.log(`[AllAnime Layer] [${timestamp}] Fetching stream info from hypothetical URL: ${streamApiUrl}`);

    try {
        // const streamResponse = await fetchWithRetry(streamApiUrl, { headers: { ... } });
        // Process streamResponse to extract the actual video URL (e.g., MP4, M3U8)
        // const actualStreamUrl = streamResponse?.data?.sources?.[0]?.url; // Highly speculative

        // For now, return the episode page link as a placeholder needing resolution
        console.warn(`[AllAnime Layer] [${timestamp}] Stream link fetching not fully implemented. Returning episode page link: ${episodeData.link}`);
        return episodeData.link; // Needs further resolution by the API handler

    } catch (err: any) {
         const error = err as Error;
         const statusCode = (error as any).response?.status;
         const errorCode = (error as any).code;
        console.error(`[AllAnime Layer] [${timestamp}] Failed to fetch streaming links for episode ${episodeData?.number}. Status: ${statusCode ?? 'N/A'}, Code: ${errorCode ?? 'N/A'}, Error: ${error.message}`);
        // console.error(`[AllAnime Layer] Error Stack: ${error.stack}`);
        return null; // Return null on failure
    }
}

export { fetchFromAllAnime, fetchEpisodesFromAllAnime, fetchStreamingLinksFromAllAnime };
