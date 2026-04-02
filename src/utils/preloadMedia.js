const mediaPromiseCache = new Map();

const storePromise = (key, factory) => {
  if (!key) return Promise.resolve();
  if (!mediaPromiseCache.has(key)) {
    mediaPromiseCache.set(key, factory());
  }
  return mediaPromiseCache.get(key);
};

export const preloadImage = (src) =>
  storePromise(`image:${src}`, () => new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.loading = 'eager';
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;
  }));

export const preloadAudio = (src) =>
  storePromise(`audio:${src}`, () => new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    let settled = false;
    const finish = (didLoad) => {
      if (settled) return;
      settled = true;
      resolve(didLoad);
    };
    audio.addEventListener('canplaythrough', () => finish(true), { once: true });
    audio.addEventListener('error', () => finish(false), { once: true });
    audio.src = src;
    audio.load();
    setTimeout(() => finish(false), 3000);
  }));

export const preloadVideo = (src) =>
  storePromise(`video:${src}`, () => new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.playsInline = true;
    video.muted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    let settled = false;

    const finish = (didLoad) => {
      if (settled) return;
      settled = true;
      video.removeAttribute('src');
      video.load();
      resolve(didLoad);
    };

    video.addEventListener('loadedmetadata', () => finish(true), { once: true });
    video.addEventListener('loadeddata', () => finish(true), { once: true });
    video.addEventListener('error', () => finish(false), { once: true });
    video.src = src;
    video.load();
    setTimeout(() => finish(false), 5000);
  }));

export const preloadMediaBundle = ({ images = [], videos = [], audio = [] }) =>
  Promise.allSettled([
    ...images.map(preloadImage),
    ...videos.map(preloadVideo),
    ...audio.map(preloadAudio),
  ]);
