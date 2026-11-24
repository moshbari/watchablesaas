export const extractVideoUrl = (inputUrl: string): string => {
  try {
    const url = new URL(inputUrl);
    
    // Check for common video player URLs that contain the actual video as a parameter
    const videoParams = ['url', 'src', 'video', 'file', 'media'];
    
    for (const param of videoParams) {
      const videoUrl = url.searchParams.get(param);
      if (videoUrl) {
        const decodedUrl = decodeURIComponent(videoUrl);
        // Verify it's a valid video file URL
        if (isVideoFileUrl(decodedUrl)) {
          return decodedUrl;
        }
      }
    }
    
    // If no parameters found or not a video file, return original URL
    return inputUrl;
  } catch {
    // If URL parsing fails, return original
    return inputUrl;
  }
};

export const isVideoFileUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    
    // Common video file extensions
    const videoExtensions = [
      '.mp4', '.webm', '.ogg', '.ogv', '.avi', '.mov', 
      '.wmv', '.flv', '.mkv', '.m4v', '.3gp'
    ];
    
    return videoExtensions.some(ext => pathname.endsWith(ext));
  } catch {
    return false;
  }
};

export const isYouTubeUrl = (url: string): boolean => {
  return /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/.test(url);
};

export const getYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export const isGoogleDriveUrl = (url: string): boolean => {
  return /(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=)/.test(url);
};

export const getGoogleDriveId = (url: string): string | null => {
  // Matches both /file/d/FILE_ID and open?id=FILE_ID formats
  const regExp = /(?:\/file\/d\/|open\?id=)([^/&?]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

export const isTellaUrl = (url: string): boolean => {
  // Tella links come as tella.tv/video/... and (newer) tella.com/video/...
  return /tella\.(?:tv|com)\/video\//i.test(url);
};

export const getTellaId = (url: string): string | null => {
  // Matches tella.tv|tella.com /video/VIDEO_ID (optionally /embed, ?query, #hash)
  const regExp = /tella\.(?:tv|com)\/video\/([^/?#]+)/i;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

export const validateVideoUrl = (url: string): { isValid: boolean; type: 'youtube' | 'googledrive' | 'tella' | 'direct' | 'unknown'; extractedUrl?: string } => {
  try {
    new URL(url); // Basic URL validation
    
    const extractedUrl = extractVideoUrl(url);
    
    if (isYouTubeUrl(extractedUrl)) {
      return { isValid: true, type: 'youtube', extractedUrl };
    }
    
    if (isGoogleDriveUrl(extractedUrl)) {
      return { isValid: true, type: 'googledrive', extractedUrl };
    }
    
    if (isTellaUrl(extractedUrl)) {
      return { isValid: true, type: 'tella', extractedUrl };
    }
    
    if (isVideoFileUrl(extractedUrl) || extractedUrl !== url) {
      return { isValid: true, type: 'direct', extractedUrl };
    }
    
    return { isValid: true, type: 'unknown', extractedUrl: url };
  } catch {
    return { isValid: false, type: 'unknown' };
  }
};

/**
 * The start point written into a video link, in seconds, the way YouTube reads it:
 * ?t=163, ?t=163s, ?t=2m43s, ?t=1h2m3s, ?start=163, or #t=163. Undefined when there is none.
 */
export const getUrlStartTime = (url: string): number | undefined => {
  try {
    const u = new URL(url);
    const hash = new URLSearchParams(u.hash.replace(/^#/, ''));
    const raw = u.searchParams.get('t') ?? u.searchParams.get('start') ?? hash.get('t');
    if (!raw) return undefined;
    const value = raw.trim().toLowerCase();
    let seconds: number;
    if (/^\d+(\.\d+)?s?$/.test(value)) {
      seconds = parseFloat(value);
    } else {
      const m = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
      if (!m || !(m[1] || m[2] || m[3])) return undefined;
      seconds = Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
    }
    return seconds > 0 ? seconds : undefined;
  } catch {
    return undefined;
  }
};
