let audioContext = null;
let primingPromise = null;
let isPrimed = false;
const bufferCache = new Map();

const getAudioContextClass = () => {
  if (typeof window === 'undefined') return null;
  return window.AudioContext || window.webkitAudioContext || null;
};

export const getIOSVoiceoverContext = () => {
  const AudioContextClass = getAudioContextClass();
  if (!AudioContextClass) return null;
  if (!audioContext) {
    audioContext = new AudioContextClass();
  }
  return audioContext;
};

export const primeIOSVoiceoverPlayer = async () => {
  const context = getIOSVoiceoverContext();
  if (!context) return false;
  if (isPrimed && context.state === 'running') return true;
  if (primingPromise) return primingPromise;

  primingPromise = (async () => {
    try {
      if (context.state !== 'running') {
        await context.resume();
      }

      // Play a tiny silent buffer as part of the user gesture to unlock playback on iOS.
      const buffer = context.createBuffer(1, 1, context.sampleRate);
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start(0);
      source.stop(context.currentTime + 0.001);

      isPrimed = true;
      return true;
    } catch {
      return false;
    } finally {
      primingPromise = null;
    }
  })();

  return primingPromise;
};

export const loadIOSVoiceoverBuffer = (src) => {
  if (!src) return Promise.resolve(null);

  if (!bufferCache.has(src)) {
    bufferCache.set(src, (async () => {
      const context = getIOSVoiceoverContext();
      if (!context) return null;

      const response = await fetch(src, { cache: 'force-cache' });
      const arrayBuffer = await response.arrayBuffer();
      const decodedBuffer = await context.decodeAudioData(arrayBuffer.slice(0));
      return decodedBuffer;
    })().catch(() => null));
  }

  return bufferCache.get(src);
};
