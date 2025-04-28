'use server';

/**
 * @fileOverview Defines functions for interacting with AnimePahe API.
 *
 * - getAnimeEpisodesPahe - A function that handles the AI-powered search process.
 * - getAnimeStreamingLinkPahe - A function that handles the AI-powered search process.
 */

import { cache } from 'react';
import { config } from '@/config';
import { JSDOM } from 'jsdom';

// --- Interfaces ---
interface AnimePaheEpisode {
  id: string;
  episode: number;
  title?: string | null;
  url?: string | null; // Direct link to stream
}

interface AnimePaheCDNLink {
  file: string; //Stream URL
  label: string; //Quality name
  audio: string;
  resolution: string;
  size: string;
  url: string;
}
interface AnimePaheResult {
  data: AnimePaheEpisode[],
  last_page: number
}

interface AnimePaheSession {
  id: string;
  title: string;
  snapshot: string;
}

/**
 * @param malId:string
 * @param page:number
 * @returns Promise<AnimePaheEpisode>
 */
export const getAnimeEpisodesPahe = cache(
  async (malId: string, page: number = 1): Promise<AnimePaheEpisode[]> => {
    const BASE_URL = 'https://animepahe.org/api';
    const ANIME_PAHE_ID = malId;
    const L = 30;
    const SORT = 'episode_asc';
    const targetUrl = `${BASE_URL}?m=release&id=${ANIME_PAHE_ID}&l=${L}&sort=${SORT}&page=${page}`;
    console.log(`[getAnimeEpisodesPahe] Fetching ${targetUrl}`);
    try {
      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error(
          `[getAnimeEpisodesPahe] API responded with status ${res.status}: ${errorBody}`
        );
        if (res.status === 404) {
          console.warn(
            `[getAnimeEpisodesPahe] No episodes found (404) for MAL ID ${malId}`
          );
          return []; // Return empty array if API confirms not found
        }
        throw new Error(
          `AnimePahe API request failed: ${res.status} ${res.statusText}`
        );
      }
      const data: AnimePaheResult = await res.json();

      const mappedEpisodes: AnimePaheEpisode[] = data.data.map(ep => ({
        id: ep.id,
        episode: ep.episode,
        title: `Episode ${ep.episode}`, // weeb-api often lacks titles in the list
        url: `https://animepahe.com/play/${ANIME_PAHE_ID}/${ep.id}`
      }));

      return mappedEpisodes;
    } catch (error: any) {
      console.error(
        `[getAnimeEpisodesPahe] Failed to fetch episodes for MAL ID ${malId} from AnimePahe.`
      );
      console.error('[getAnimeEpisodesPahe] Fetch Error Details:', error.message);
      return [];
    }
  }
);

/**
 * @param episodeId:string
 * @returns Promise<AnimePaheCDNLink>
 */
export const getAnimeStreamingLinkPahe = cache(async (episodeId: string): Promise<AnimePaheCDNLink[]> => {
  const BASE_URL = 'https://animepahe.com/play/';
  const targetURL = `${BASE_URL}${episodeId}`;

  console.log(`Attempting to fetch streamData from  ${targetURL}`);
  try {
    const res = await fetch(targetURL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(
        `[getAnimeStreamingLinkPahe] API responded with status ${res.status}: ${errorBody}`
      );
      throw new Error(`AnimePahe API request failed: ${res.status} ${res.statusText}`);
    }

    const text = await res.text();
    const dom = new JSDOM(text);
    const window = dom.window;
    const document = window.document;

    // Function to extract the session value
    function extractSession(url: string): string | null {
      const regex = /session = "([^"]+)"/;
      const match = url.match(regex);
      return match ? match[1] : null;
    }

    // Function to extract the anime_id value
    function extractAnimeId(url: string): string | null {
        const regex = /anime_id = "([^"]+)"/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }
      // Function to extract the id value from the URL
    function extractId(url: string): string | null {
        const regex = /id = "([^"]+)"/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }
    const animeId = extractAnimeId(document.documentElement.outerHTML)
    const session = extractSession(document.documentElement.outerHTML)

    if (!animeId || !session){
      console.error(`No anime id or session`);
      return [];
    }

    const secondRes = await fetch(`https://animepahe.org/api?m=links&id=${animeId}&session=${session}&p=kwik`, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      }
    })

    if (!secondRes.ok) {
      const errorBody = await secondRes.text();
      console.error(
        `[getAnimeStreamingLinkPahe] API responded with status ${secondRes.status}: ${errorBody}`
      );
      throw new Error(`AnimePahe API request failed: ${secondRes.status} ${secondRes.statusText}`);
    }

    const episodeJson = await secondRes.json() as {data: {audio: string, resolution: string, size:string, id:string}[]};
    const id = extractId(document.documentElement.outerHTML);

    const cdnUrls = episodeJson.data.map(cdn => {
      return {
        file: `https://animepahe.org/release/${id}/${cdn.id}`,
        label: `${cdn.resolution}p`,
        audio: cdn.audio,
        resolution: cdn.resolution,
        size: cdn.size,
        url: `https://animepahe.org/release/${id}/${cdn.id}`
      }
    })

    return cdnUrls;
  } catch (error: any) {
    console.error(
      `[getAnimeStreamingLinkPahe] Failed to fetch streamData for episodeId ${episodeId} from AnimePahe.`
    );
    console.error('[getAnimeStreamingLinkPahe] Fetch Error Details:', error);
    return [];
  }
});

/**
 *  * @returns Promise<AnimePaheSession>
 */
export const getAnimePaheSession = cache(
    async (animeTitle: string): Promise<AnimePaheSession | null> => {
      const BASE_URL = 'https://animepahe.com/';
      const targetURL = `${BASE_URL}?s=${animeTitle}`;

      console.log(`Attempting to fetch streamData from  ${targetURL}`);
      try {
        const res = await fetch(targetURL, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const errorBody = await res.text();
          console.error(
              `[getAnimePaheSession] API responded with status ${res.status}: ${errorBody}`
          );
          throw new Error(`AnimePahe API request failed: ${res.status} ${res.statusText}`);
        }

        const text = await res.text();
        const dom = new JSDOM(text);
        const window = dom.window;
        const document = window.document;

        const animeBlock = document.querySelector(".anime-thumb-container");
        if (!animeBlock){
          console.log(`Cant find class name anime-thumb-container`);
          return null;
        }
        const animeLink = animeBlock.querySelector("a");
          if (!animeLink){
            console.log(`Cant find a inside anime-thumb-container`);
            return null;
        }
        const animeUrl = animeLink?.getAttribute("href");
          if (!animeUrl){
             console.log(`Cant find animeUrl inside a in anime-thumb-container`);
             return null;
        }
        const snapShotDiv = animeBlock.querySelector("img") as HTMLImageElement;
        if (!snapShotDiv){
             console.log(`Cant find img inside anime-thumb-container`);
             return null;
        }

        const snapShot = snapShotDiv?.getAttribute("data-src");
        const hrefParts = animeUrl.split("/");
        const id = hrefParts[hrefParts.length - 1];

        return {
            id: id,
            title: animeTitle,
            snapshot: snapShot ?? "",
        };

      } catch (error: any) {
        console.error(
            `[getAnimePaheSession] Failed to fetch data for animeTitle ${animeTitle} from AnimePahe.`
        );
        console.error('[getAnimePaheSession] Fetch Error Details:', error);
        return null;
      }
    }
);
