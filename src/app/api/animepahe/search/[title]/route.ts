
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
    session: string; // This is the ID we need
}

interface AnimePaheSearchResponse {
    data: AnimePaheSearchResult[];
}

/**
 * Handles GET requests to search for an AnimePahe session ID based on title.
 * This route performs the actual search/scraping using JSDOM.
 *
 * @param request The incoming request.
 * @param params The dynamic parameters from the URL, containing the title.
 * @returns A NextResponse with the found AnimePahe ID or an error/null.
 */
export async function GET(
    request: Request,
    { params }: { params: { title: string } }
) {
    const animeTitle = decodeURIComponent(params.title);

    if (!animeTitle) {
        return NextResponse.json({ message: 'Missing anime title' }, { status: 400 });
    }

    // Use the AnimePahe API for searching first
    const SEARCH_API_URL = 'https://animepahe.org/api';
    const targetURL = `${SEARCH_API_URL}?m=search&q=${encodeURIComponent(animeTitle)}`;
    let response: Response | undefined;

    console.log(`[API/animepahe/search] Searching AnimePahe API for: "${animeTitle}" at ${targetURL}`);
    try {
        response = await fetch(targetURL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
                'Accept': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[API/animepahe/search] Search API failed. Status: ${response.status}: ${errorBody}`);
            // If API fails, proceed to scraping fallback
        } else {
            const searchResponse: AnimePaheSearchResponse = await response.json();
            if (searchResponse?.data?.length > 0) {
                const firstResult = searchResponse.data[0];
                const sessionId = firstResult?.session;
                if (sessionId) {
                    console.log(`[API/animepahe/search] Found AnimePahe session ID ${sessionId} via API for "${animeTitle}"`);
                    return NextResponse.json({ animePaheId: sessionId }); // Success! Return the ID
                }
                 console.warn(`[API/animepahe/search] API search result for "${animeTitle}" missing 'session' ID. Result:`, firstResult);
            } else {
                 console.warn(`[API/animepahe/search] No API search results found for "${animeTitle}".`);
            }
        }

        // --- Fallback: Scrape search results page if API fails or yields no ID ---
        console.log(`[API/animepahe/search] Falling back to scraping search page for "${animeTitle}"`);
        const SEARCH_PAGE_URL = `https://animepahe.org/search?q=${encodeURIComponent(animeTitle)}`;
        const pageResponse = await fetch(SEARCH_PAGE_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
                'Accept': 'text/html',
            },
            cache: 'no-store',
        });

        if (!pageResponse.ok) {
            console.error(`[API/animepahe/search] Scraping fallback failed. Status: ${pageResponse.status}`);
            return NextResponse.json({ message: 'Failed to search AnimePahe (Scraping Error)' }, { status: 502 });
        }

        const html = await pageResponse.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;
        // Target the link within the search result item specifically
        const firstResultLink = document.querySelector('.search-results .hover > div > h5 > a'); // More specific selector

        if (firstResultLink) {
            const animeUrl = firstResultLink.getAttribute('href');
            if (animeUrl) {
                // Extract the ID from the URL (e.g., /anime/4874)
                const match = animeUrl.match(/\/anime\/(\d+)/);
                const id = match ? match[1] : null;
                // const hrefParts = animeUrl.split('/');
                // const id = hrefParts.pop() || hrefParts.pop(); // Original ID extraction
                if (id && /^\d+$/.test(id)) { // Validate it's numeric
                    console.log(`[API/animepahe/search] Found ID ${id} via scraping fallback for "${animeTitle}".`);
                    return NextResponse.json({ animePaheId: id }); // Return the session ID string
                } else {
                    console.warn(`[API/animepahe/search] Could not extract valid numeric ID from scraped URL: ${animeUrl}`);
                }
            } else {
                 console.warn(`[API/animepahe/search] Scraped link found but has no href attribute.`);
            }
        } else {
            console.warn(`[API/animepahe/search] Scraping fallback also found no results for "${animeTitle}". Selector used: .search-results .hover > div > h5 > a`);
        }

        // If neither API nor scraping worked
        console.warn(`[API/animepahe/search] Failed to find AnimePahe ID for "${animeTitle}" using both methods.`);
        return NextResponse.json({ animePaheId: null }, { status: 404 }); // Indicate not found

    } catch (error: any) {
        console.error(`[API/animepahe/search] Unexpected error searching for "${animeTitle}". URL: ${targetURL}`);
        if(response) {
            console.error('[API/animepahe/search] Response Status:', response.status, response.statusText);
        }
        console.error('[API/animepahe/search] Error Details:', error.message);
        return NextResponse.json({ message: 'Internal server error during AnimePahe search.', error: error.message }, { status: 500 });
    }
}
