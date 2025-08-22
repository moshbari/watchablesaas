import { useState, useEffect, useCallback, useRef } from 'react';

interface VideoProgress {
  url: string;
  timestamp: number;
  lastUpdated: number;
}

export const useVideoProgress = (videoUrl: string) => {
  const [savedProgress, setSavedProgress] = useState<number | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedTimeRef = useRef<number>(0);

  const STORAGE_KEY = 'video-progress';
  const SAVE_INTERVAL = 5000; // Save every 5 seconds
  const MIN_PROGRESS = 10; // Only save if watched for at least 10 seconds
  const RESUME_THRESHOLD = 30; // Show resume modal if more than 30 seconds watched

  // Load saved progress on mount
  useEffect(() => {
    console.log('🎬 Loading progress effect triggered for URL:', videoUrl);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      console.log('🎬 Checking stored progress for:', videoUrl);
      console.log('🎬 localStorage content:', stored);
      if (stored) {
        const progressData: VideoProgress[] = JSON.parse(stored);
        console.log('All stored progress:', progressData);
        const videoProgress = progressData.find(p => p.url === videoUrl);
        console.log('Progress for current video:', videoProgress);
        console.log('RESUME_THRESHOLD:', RESUME_THRESHOLD);
        
        if (videoProgress) {
          console.log('Found progress, timestamp:', videoProgress.timestamp, 'threshold:', RESUME_THRESHOLD);
          if (videoProgress.timestamp >= RESUME_THRESHOLD) {
            console.log('Setting saved progress and showing resume modal:', videoProgress.timestamp);
            setSavedProgress(videoProgress.timestamp);
            setShowResumeModal(true);
          } else {
            console.log('Progress below threshold:', videoProgress.timestamp, '<', RESUME_THRESHOLD);
          }
        } else {
          console.log('No progress found for this video URL');
        }
      } else {
        console.log('No stored progress found in localStorage');
      }
    } catch (error) {
      console.error('Error loading video progress:', error);
    }
  }, [videoUrl]);

  const saveProgress = useCallback((currentTime: number) => {
    console.log('🎬 saveProgress called with currentTime:', currentTime, 'for URL:', videoUrl);
    console.log('🎬 MIN_PROGRESS:', MIN_PROGRESS, 'lastSavedTime:', lastSavedTimeRef.current);
    // Only save if enough time has passed and video has been watched for minimum duration
    if (currentTime < MIN_PROGRESS || currentTime - lastSavedTimeRef.current < 5) {
      console.log('🎬 Not saving - currentTime < MIN_PROGRESS or too soon since last save');
      return;
    }

    console.log('Scheduling save for URL:', videoUrl, 'at time:', currentTime);
    // Debounce saves to avoid excessive localStorage writes
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        console.log('Actually saving progress for URL:', videoUrl, 'at time:', currentTime);
        const stored = localStorage.getItem(STORAGE_KEY);
        let progressData: VideoProgress[] = stored ? JSON.parse(stored) : [];
        
        // Remove existing entry for this video
        progressData = progressData.filter(p => p.url !== videoUrl);
        
        // Add new progress entry
        progressData.push({
          url: videoUrl,
          timestamp: currentTime,
          lastUpdated: Date.now()
        });

        // Keep only last 10 videos to prevent storage bloat
        progressData.sort((a, b) => b.lastUpdated - a.lastUpdated);
        progressData = progressData.slice(0, 10);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
        console.log('Progress saved successfully. New localStorage content:', JSON.stringify(progressData));
        lastSavedTimeRef.current = currentTime;
      } catch (error) {
        console.error('Error saving video progress:', error);
      }
    }, 1000); // Debounce by 1 second
  }, [videoUrl]);

  const clearProgress = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        let progressData: VideoProgress[] = JSON.parse(stored);
        progressData = progressData.filter(p => p.url !== videoUrl);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
      }
      setSavedProgress(null);
    } catch (error) {
      console.error('Error clearing video progress:', error);
    }
  }, [videoUrl]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    savedProgress,
    saveProgress,
    clearProgress,
    showResumeModal,
    setShowResumeModal
  };
};
