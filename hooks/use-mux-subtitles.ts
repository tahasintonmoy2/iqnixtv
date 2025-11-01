import { createProxyVTTUrl, validateSubtitles } from '@/lib/utils';
import { useCallback, useEffect, useState } from 'react';

interface SubtitleTrack {
  id: number;
  active: boolean;
  type: string;
  bandwidth?: number;
  language: string;
  label: string | null;
  kind: string | null;
  mimeType: string | null;
  primary: boolean;
  roles: string[];
  forced: boolean;
  originalTextId: string | null;
}

interface UseMuxSubtitlesResult {
  subtitles: SubtitleTrack[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseMuxSubtitlesOptions {
  validate?: boolean;
  useProxy?: boolean;
}

export function useMuxSubtitles(
  playbackId: string, 
  options: UseMuxSubtitlesOptions = {}
): UseMuxSubtitlesResult {
  const { validate = false, useProxy = false } = options;
  const [subtitles, setSubtitles] = useState<SubtitleTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubtitles = useCallback(async () => {
    if (!playbackId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch subtitles from API
      const response = await fetch(`/api/series/subtitles/${playbackId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      let fetchedSubtitles = data.subtitles || [];

      // Validate subtitles if requested
      if (validate && fetchedSubtitles.length > 0) {
        fetchedSubtitles = await validateSubtitles(fetchedSubtitles);
      }

      // Use proxy for CORS if requested
      if (useProxy && fetchedSubtitles.length > 0) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        fetchedSubtitles = fetchedSubtitles.map((sub) => ({
          ...sub,
          src: createProxyVTTUrl(sub.src)
        }));
      }

      setSubtitles(fetchedSubtitles);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch subtitles');
      setError(error);
      console.error('Error loading subtitles:', error);
      setSubtitles([]);
    } finally {
      setLoading(false);
    }
  }, [playbackId, useProxy, validate]);

  useEffect(() => {
    fetchSubtitles();
  }, [playbackId, validate, useProxy, fetchSubtitles]);

  return {
    subtitles,
    loading,
    error,
    refetch: fetchSubtitles,
  };
}