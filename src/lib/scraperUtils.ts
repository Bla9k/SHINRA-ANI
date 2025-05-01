// Removed 'use server' directive as this file contains utility functions, not server actions.

import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import * as cheerio from 'cheerio'; // Keep cheerio import if needed for handleCaptchaOrChallenge

// --- User-Agent Rotation ---
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
  // Add more diverse and realistic user agents
];

export function getRandomUserAgent(): string {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// --- Proxy Management ---
// Load proxies from environment variables (recommended) or define a list here
// Example ENV variable: PROXY_LIST="http://user:pass@proxy1:8080,http://user:pass@proxy2:8080"
const proxyList: string[] = (process.env.PROXY_LIST || '').split(',').filter(p => p.trim() !== '');

function getRandomProxy(): string | undefined {
  if (proxyList.length === 0) {
    return undefined;
  }
  return proxyList[Math.floor(Math.random() * proxyList.length)];
}

export function getProxyAgent(): HttpsProxyAgent<string> | undefined {
    const proxyUrl = getRandomProxy();
    if (!proxyUrl) {
        // console.warn('[ScraperUtils] No proxies configured or available.'); // Keep console logs server-side
        return undefined;
    }
    try {
        // Ensure the proxy URL includes the protocol (http or https)
        const agent = new HttpsProxyAgent(proxyUrl);
        // console.log(`[ScraperUtils] Using proxy: ${proxyUrl.split('@')[1] || proxyUrl}`); // Keep console logs server-side
        return agent;
    } catch (error) {
         console.error(`[ScraperUtils] Error creating proxy agent for ${proxyUrl}:`, error);
         return undefined;
    }
}


// --- Delay Function ---
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Retry Logic ---
interface RetryOptions {
  retries: number;
  delayMs: number;
  backoffFactor?: number; // e.g., 2 for exponential backoff
}

export async function fetchWithRetry<T>(
  url: string,
  axiosOptions: AxiosRequestConfig = {},
  retryOptions: RetryOptions = { retries: 3, delayMs: 1500, backoffFactor: 1.5 } // Increased base delay
): Promise<T> {
  let lastError: AxiosError | Error | null = null;
  let currentDelay = retryOptions.delayMs;
  const timestamp = new Date().toISOString();

  for (let i = 0; i <= retryOptions.retries; i++) {
    try {
      // Add User-Agent and Proxy Agent to every request
      const agent = getProxyAgent();
      const finalOptions: AxiosRequestConfig = {
        ...axiosOptions,
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          // Add Referer if applicable in the calling function's options
          ...(axiosOptions.headers || {}),
        },
        ...(agent && { httpsAgent: agent, proxy: false }), // Use agent for https, disable default proxy handling
         timeout: 15000, // Add a timeout (e.g., 15 seconds)
      };

      console.log(`[fetchWithRetry] [${timestamp}] Attempt ${i + 1}/${retryOptions.retries + 1} - Fetching: ${url}`);
      const response = await axios.get<T>(url, finalOptions);

      // Basic Cloudflare check (can be improved)
      if (response.headers['server']?.includes('cloudflare') && (response.status === 403 || response.status === 503)) {
          console.warn(`[fetchWithRetry] [${timestamp}] Cloudflare protection likely encountered for ${url}. Status: ${response.status}.`);
          throw new Error(`Cloudflare protection detected (${response.status})`);
      }
       // Check for common blocking status codes
      if (response.status === 403 || response.status === 429) {
           console.warn(`[fetchWithRetry] [${timestamp}] Blocked or rate limited on attempt ${i + 1} for ${url}. Status: ${response.status}.`);
           throw new Error(`Request blocked or rate limited (${response.status})`);
      }
      if (response.status >= 500) { // Retry on server errors (5xx)
          console.warn(`[fetchWithRetry] [${timestamp}] Server error on attempt ${i + 1} for ${url}. Status: ${response.status}.`);
          throw new Error(`Server error (${response.status})`);
      }
      // Potentially check response content for anti-bot messages here if needed

      return response.data; // Success

    } catch (error) {
      lastError = error as AxiosError | Error;
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const code = (axiosError.code || 'UNKNOWN_ERROR') as string;

      console.warn(`[fetchWithRetry] [${timestamp}] Attempt ${i + 1} failed for ${url}. Status: ${status || 'N/A'}, Code: ${code}, Error: ${axiosError.message}`);

      // Decide if retry is appropriate
      const isNetworkError = ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN', 'ECONNABORTED'].includes(code);
      // Retry on 403 (CF/Forbidden), 429 (Rate Limit), 5xx (Server Error), and network errors
      const isRetryableStatus = status && (status === 403 || status === 429 || status >= 500);

      if (i < retryOptions.retries && (isNetworkError || isRetryableStatus)) {
        const retryDelay = currentDelay + Math.random() * 500; // Add jitter
        console.log(`[fetchWithRetry] [${timestamp}] Retrying in ${retryDelay.toFixed(0)}ms...`);
        await delay(retryDelay);
        currentDelay *= retryOptions.backoffFactor || 1; // Apply backoff
      } else {
        console.error(`[fetchWithRetry] [${timestamp}] Final attempt failed for ${url}. Error: ${lastError?.message}`);
        // Rethrow the last encountered error after all retries
        throw lastError;
      }
    }
  }

  // Should not be reached if retries > 0, but needed for type safety
  throw lastError || new Error('fetchWithRetry failed after all retries.');
}

// --- CAPTCHA/DDoS Handling (Placeholder) ---
export async function handleCaptchaOrChallenge(htmlContent: string, url: string): Promise<string | null> {
    const timestamp = new Date().toISOString();
    // Basic checks for Cloudflare or common CAPTCHA indicators
    // More robust detection would involve checking for specific script tags, CSS classes, or challenge forms.
    if (htmlContent.includes('challenge-running') || htmlContent.includes('cf-challenge') || htmlContent.includes('captcha') || htmlContent.includes('Verify you are human')) {
        console.warn(`[handleCaptchaOrChallenge] [${timestamp}] CAPTCHA or challenge detected on ${url}. Bypass not implemented.`);
        // In a real scenario, trigger Puppeteer/Playwright or a CAPTCHA solving service here.
        // For now, return null to indicate the block.
        return null;
    }
    // If no challenge detected, return original content
    return htmlContent;
}
