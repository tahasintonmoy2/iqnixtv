import { SubtitleTrack } from "@/components/video-player";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format time (seconds to MM:SS)
export function formatTime(time: number) {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);

  if (hours > 0) {
    return `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export function parseSubtitlesFromManifest(
  manifest: string,
  playbackId: string
) {
  const subtitles: Array<{ label: string; language: string; src: string }> = [];
  const lines = manifest.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes("#EXT-X-MEDIA:TYPE=SUBTITLES")) {
      const languageMatch = line.match(/LANGUAGE="([^"]+)"/);
      const nameMatch = line.match(/NAME="([^"]+)"/);
      const uriMatch = line.match(/URI="([^"]+)"/);

      if (languageMatch && uriMatch) {
        const language = languageMatch[1];
        const label = nameMatch ? nameMatch[1] : language.toUpperCase();
        const uri = uriMatch[1];

        const src = uri.startsWith("http")
          ? uri
          : `https://stream.mux.com/${playbackId}/${uri}`;

        subtitles.push({
          label,
          language,
          src,
        });
      }
    }
  }

  return subtitles;
}

export function sanitizeVTTContent(content: string): string {
  let sanitized = content.trim();

  // Ensure WEBVTT signature is on first line
  if (!sanitized.startsWith("WEBVTT")) {
    sanitized = "WEBVTT\n\n" + sanitized;
  }

  // Ensure proper line endings
  sanitized = sanitized.replace(/\r\n/g, "\n");

  // Remove any BOM (Byte Order Mark)
  sanitized = sanitized.replace(/^\uFEFF/, "");

  return sanitized;
}

export function createProxyVTTUrl(originalUrl: string): string {
  return `/api/vtt-proxy?url=${encodeURIComponent(originalUrl)}`;
}

export async function getMuxSubtitles(playbackId: string): Promise<SubtitleTrack[]> {
  try {
    // Fetch the master playlist
    const manifestUrl = `https://stream.mux.com/${playbackId}.m3u8`;
    const response = await fetch(manifestUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`Failed to fetch Mux manifest: ${response.status} ${response.statusText}`);
      return [];
    }

    const manifestText = await response.text();
    const subtitles = parseSubtitlesFromManifest(manifestText, playbackId);

    console.log(`Found ${subtitles.length} subtitle tracks for playback ID: ${playbackId}`);
    return subtitles;
  } catch (error) {
    console.error('Error fetching Mux subtitles:', error);
    return [];
  }
}

export async function validateVTTFile(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    
    // Check if request was successful
    if (!response.ok) {
      console.error(`VTT file not accessible: ${url} (${response.status})`);
      return false;
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('text/vtt') && !contentType.includes('text/plain')) {
      console.warn(`Unexpected content-type for VTT: ${contentType}`);
    }

    return true;
  } catch (error) {
    console.error(`Failed to validate VTT file: ${url}`, error);
    return false;
  }
}

export async function validateSubtitles(subtitles: SubtitleTrack[]): Promise<SubtitleTrack[]> {
  const validatedSubtitles: SubtitleTrack[] = [];

  const validationPromises = subtitles.map(async (subtitle) => {
    try {
      const isValid = await validateVTTFile(subtitle.src);
      if (isValid) {
        return subtitle;
      }
      console.warn(`Skipping invalid subtitle track: ${subtitle.label}`);
      return null;
    } catch (error) {
      console.error(`Error validating subtitle: ${subtitle.label}`, error);
      return null;
    }
  });

  const results = await Promise.all(validationPromises);
  
  // Filter out null values
  results.forEach(result => {
    if (result) {
      validatedSubtitles.push(result);
    }
  });

  return validatedSubtitles;
}
