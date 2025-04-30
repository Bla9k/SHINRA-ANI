
'use server';

import { NextResponse } from 'next/server';
import { JSDOM } from 'jsdom'; // Import JSDOM only here

// Interfaces matching the service (can be shared later)
interface AnimePaheSearchResult {
    id: number;
    title: string;
    poster: string;
    type: string;
    episodes: number;
    status: string;
    season: string;
    year: number;
    score: number;
    session: string; // This is the AnimePahe ID we need
}

interface AnimePaheSearchResponse {
    data: AnimePaheSearchResult[];
}

/**
 * Handles GET requests to search for an AnimePahe ID based on MAL ID or title.
 * This route performs the actual search/scraping.
 * It prioritizes searching by MAL ID if the input looks like one.
 *
 * @param request The incoming request.
 * @param params The dynamic parameters from the URL, containing the identifier (MAL ID or title).
 *               Parameter name kept as 'title' for backward compatibility but handles both.
 * @returns A NextResponse with the found AnimePahe ID or an error/null.
 */
export async function GET(
    request: Request,
    { params }: { params: { title: string } } // Param name 'title' kept, but it holds MAL ID or title
) {
    const identifier = decodeURIComponent(params.title); // Can be MAL ID or title
    const isPotentialMalId = /^\d+$/.test(identifier); // Check if it looks like an ID

    if (!identifier) {
        return NextResponse.json({ message: 'Missing identifier (MAL ID or title)' }, { status: 400 });
    }

    const SEARCH_API_URL = 'https://animepahe.org/api';
    let targetURL = '';
    let apiResponse: Response | undefined;
    let pageResponse: Response | undefined;

    // --- Priority 1: Search AnimePahe API using MAL ID ---
    if (isPotentialMalId) {
        targetURL = `${SEARCH_API_URL}?m=release&id=${identifier}&l=1&sort=episode_asc&page=1`; // Use release endpoint with limit 1 to check if ID exists
        console.log(`[API/animepahe/search] Checking AnimePahe API existence for MAL ID: "${identifier}" at ${targetURL}`);
        try {
             apiResponse = await fetch(targetURL, {
                headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
                cache: 'no-store',
             });

             if (apiResponse.ok) {
                 // If OK, it means the anime exists on AnimePahe with this ID (or closely related)
                 // AnimePahe API doesn't directly return the internal 'session' ID via MAL ID lookup
                 // We still need to search by title to get the session ID reliably.
                 // This check primarily confirms if scraping by title is likely to succeed.
                 console.log(`[API/animepahe/search] MAL ID ${identifier} likely exists on AnimePahe. Proceeding to search by title.`);
                 // We will continue to the title search below.
             } else if (apiResponse.status === 404) {
                 console.log(`[API/animepahe/search] MAL ID ${identifier} not found directly via AnimePahe API (404).`);
                 // Don't give up yet, try searching by title.
             } else {
                 // Log other errors but still proceed to title search as fallback
                  const errorBody = await apiResponse.text();
                  console.warn(`[API/animepahe/search] AnimePahe API check failed for MAL ID ${identifier}. Status: ${apiResponse.status}: ${errorBody}. Proceeding to title search.`);
             }

        } catch (error: any) {
            console.error(`[API/animepahe/search] Error checking MAL ID ${identifier} existence on AnimePahe:`, error.message);
             // Proceed to title search as fallback
        }
    }

    // --- Priority 2: Search AnimePahe API by Title ---
    // This runs if the identifier wasn't a MAL ID OR if the MAL ID check didn't yield a direct result.
    const searchTitle = identifier; // Use the original identifier as the title
    targetURL = `${SEARCH_API_URL}?m=search&q=${encodeURIComponent(searchTitle)}`;
    console.log(`[API/animepahe/search] Searching AnimePahe API by title: "${searchTitle}" at ${targetURL}`);

    try {
        apiResponse = await fetch(targetURL, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
            cache: 'no-store',
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.text();
            console.warn(`[API/animepahe/search] Search API by title failed. Status: ${apiResponse.status}: ${errorBody}. Proceeding to scraping fallback.`);
            // Fall through to scraping
        } else {
            const searchResponse: AnimePaheSearchResponse = await apiResponse.json();
            if (searchResponse?.data?.length > 0) {
                // Find the best match (e.g., exact title match or first result)
                const firstResult = searchResponse.data[0]; // Simple approach: take the first result
                const sessionId = firstResult?.session;
                if (sessionId) {
                    console.log(`[API/animepahe/search] Found AnimePahe session ID ${sessionId} via API for "${searchTitle}"`);
                    return NextResponse.json({ animePaheId: sessionId }); // Success via API!
                }
                 console.warn(`[API/animepahe/search] API search result for "${searchTitle}" missing 'session' ID. Result:`, firstResult);
            } else {
                 console.warn(`[API/animepahe/search] No API search results found for "${searchTitle}".`);
            }
        }

        // --- Fallback: Scrape search results page if API fails or yields no ID ---
        console.log(`[API/animepahe/search] Falling back to scraping search page for "${searchTitle}"`);
        const SEARCH_PAGE_URL = `https://animepahe.org/search?q=${encodeURIComponent(searchTitle)}`;
        pageResponse = await fetch(SEARCH_PAGE_URL, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' },
            cache: 'no-store',
        });

        if (!pageResponse.ok) {
             const scrapingErrorBody = await pageResponse.text().catch(() => "Could not read error body");
             console.error(`[API/animepahe/search] Scraping fallback failed. Status: ${pageResponse.status} ${pageResponse.statusText}. Body: ${scrapingErrorBody.substring(0, 500)}...`); // Log status text and beginning of body
            return NextResponse.json({ message: `Failed to search AnimePahe (Scraping Error: ${pageResponse.status})` }, { status: 502 });
        }

        const html = await pageResponse.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;
        // Target the link within the first search result item specifically
        const firstResultLink = document.querySelector('.search-results .hover > div > h5 > a');

        if (firstResultLink) {
            const animeUrl = firstResultLink.getAttribute('href');
            if (animeUrl) {
                // Extract the AnimePahe internal anime ID from the URL (e.g., /anime/4874)
                const match = animeUrl.match(/\/anime\/(\d+)/);
                const animePaheInternalId = match ? match[1] : null;
                if (animePaheInternalId) {
                    console.log(`[API/animepahe/search] Found AnimePahe Internal ID ${animePaheInternalId} via scraping fallback for "${searchTitle}".`);
                    // IMPORTANT: The API search returns the *session* ID needed for episodes.
                    // Scraping the search results page gives the *internal anime ID*.
                    // We might need BOTH depending on the context. Let's return the internal ID found via scraping.
                    // The calling function needs to be aware of this potential difference.
                    // If the `session` ID is strictly required, scraping might not be sufficient.
                    // Let's assume for now the internal ID from scraping is what we need.
                    return NextResponse.json({ animePaheId: animePaheInternalId }); // Return the internal ID string
                } else {
                    console.warn(`[API/animepahe/search] Could not extract valid numeric ID from scraped URL: ${animeUrl}`);
                }
            } else {
                 console.warn(`[API/animepahe/search] Scraped link found but has no href attribute.`);
            }
        } else {
            console.warn(`[API/animepahe/search] Scraping fallback also found no results for "${searchTitle}". Selector used: .search-results .hover > div > h5 > a`);
        }

        // If neither API nor scraping worked
        console.warn(`[API/animepahe/search] Failed to find AnimePahe ID for "${searchTitle}" using both methods.`);
        return NextResponse.json({ animePaheId: null }, { status: 404 }); // Indicate not found

    } catch (error: any) {
        console.error(`[API/animepahe/search] Unexpected error searching for "${searchTitle}". URL: ${targetURL}`);
        if(apiResponse) console.error('[API/animepahe/search] API Response Status:', apiResponse.status, apiResponse.statusText);
        if(pageResponse) console.error('[API/animepahe/search] Scraping Response Status:', pageResponse.status, pageResponse.statusText);
        console.error('[API/animepahe/search] Error Details:', error.message);
        return NextResponse.json({ message: 'Internal server error during AnimePahe search.', error: error.message }, { status: 500 });
    }
}
