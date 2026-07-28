'use client';

import { useEffect, useRef } from 'react';

export function CmsVersionPoller() {
  const loadedVersionRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    // Fetch the initial version
    const fetchInitialVersion = async () => {
      try {
        const res = await fetch(`/api/cms-version?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.version === 'number') {
            loadedVersionRef.current = data.version;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch initial CMS version:', err);
      }
    };

    fetchInitialVersion();

    // Set up polling interval (every 3000ms = 3s)
    const interval = setInterval(async () => {
      if (!active || loadedVersionRef.current === null) return;

      try {
        const res = await fetch(`/api/cms-version?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.version === 'number') {
            const currentVersion = data.version;
            
            // If server version is greater than what we loaded, reload the page
            if (currentVersion > loadedVersionRef.current) {
              // Update ref immediately to prevent subsequent reload loops
              loadedVersionRef.current = currentVersion;
              
              // Trigger page reload
              window.location.reload();
            }
          }
        }
      } catch (err) {
        console.warn('Error polling CMS version:', err);
      }
    }, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return null;
}
