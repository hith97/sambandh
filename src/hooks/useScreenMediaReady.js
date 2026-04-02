import { useCallback, useEffect, useMemo, useState } from 'react';
import { preloadImage, preloadVideo } from '../utils/preloadMedia';

const normalizeMediaItems = (mediaItems = []) =>
  mediaItems
    .filter((item) => item?.src)
    .map((item, index) => ({
      id: item.id ?? `${item.type}:${item.src}:${index}`,
      type: item.type,
      src: item.src,
    }));

export const useScreenMediaReady = (mediaItems = []) => {
  const normalizedItems = normalizeMediaItems(mediaItems);
  const mediaKey = normalizedItems.map((item) => `${item.id}|${item.type}|${item.src}`).join('||');

  const stableItems = useMemo(() => normalizedItems, [mediaKey]);
  const [loadedMap, setLoadedMap] = useState({});

  useEffect(() => {
    if (!stableItems.length) {
      setLoadedMap({});
      return undefined;
    }

    const initialState = Object.fromEntries(stableItems.map((item) => [item.id, false]));
    setLoadedMap(initialState);

    let active = true;

    stableItems.forEach((item) => {
      const preloadPromise = item.type === 'video' ? preloadVideo(item.src) : preloadImage(item.src);
      preloadPromise.then((didLoad) => {
        if (!didLoad || !active) return;
        if (!active) return;
        setLoadedMap((prev) => (prev[item.id] ? prev : { ...prev, [item.id]: true }));
      });
    });

    return () => {
      active = false;
    };
  }, [mediaKey, stableItems]);

  const markAssetLoaded = useCallback((id) => {
    setLoadedMap((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  }, []);

  const isReady = stableItems.length === 0 || stableItems.every((item) => loadedMap[item.id]);

  return { isReady, markAssetLoaded };
};
