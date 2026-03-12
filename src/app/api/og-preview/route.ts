import { NextRequest, NextResponse } from 'next/server';

const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
const TIMEOUT_MS = 5000;

export type OgPreview = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
};

function extractOgFromHtml(html: string, baseUrl: string): Omit<OgPreview, 'url'> {
  const result: Omit<OgPreview, 'url'> = {};

  const patterns: Array<{ key: keyof Omit<OgPreview, 'url'>; regex: RegExp }> = [
    { key: 'title', regex: /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i },
    { key: 'title', regex: /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i },
    { key: 'description', regex: /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i },
    { key: 'description', regex: /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i },
    { key: 'image', regex: /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i },
    { key: 'image', regex: /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i },
    { key: 'siteName', regex: /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i },
    { key: 'siteName', regex: /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i },
  ];

  for (const { key, regex } of patterns) {
    const m = html.match(regex);
    if (m?.[1] && !(result[key] as string)) {
      const val = m[1].trim();
      if (key === 'image' && val && !val.startsWith('http')) {
        try {
          (result as Record<string, string>)[key] = new URL(val, baseUrl).href;
        } catch {
          (result as Record<string, string>)[key] = val;
        }
      } else {
        (result as Record<string, string>)[key] = val;
      }
    }
  }

  if (!result.title) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch?.[1]) result.title = titleMatch[1].trim();
  }

  return result;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Paramètre url requis' }, { status: 400 });
  }
  if (!URL_REGEX.test(url)) {
    return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Boomkoeur/1.0; +https://boomkoeur.com)',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ error: `HTTP ${res.status}` }, { status: 502 });
    }

    const html = await res.text();
    const baseUrl = new URL(url).origin;
    const meta = extractOgFromHtml(html, baseUrl);

    const preview: OgPreview = { url, ...meta };
    return NextResponse.json(preview);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json({ error: 'Timeout' }, { status: 504 });
    }
    console.error('[og-preview]', err);
    return NextResponse.json({ error: 'Impossible de récupérer la prévisualisation' }, { status: 502 });
  }
}
