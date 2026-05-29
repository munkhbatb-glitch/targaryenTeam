/**
 * Messenger / Facebook video call–style incoming ringtone.
 * Optional custom file: place MP3 at public/sounds/incoming-video-call.mp3
 */

const CUSTOM_RINGTONE_URL = "/sounds/incoming-video-call.mp3";
/** One melodic phrase length (ms) before it repeats */
const PHRASE_INTERVAL_MS = 2400;

/** Bright ascending chime (Messenger video call–inspired) */
const CHIME_NOTES_HZ = [880, 1108.73, 1318.51, 1760];

let active = false;
let mp3Audio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;
let phraseTimer: number | null = null;

function clearPhraseTimer() {
  if (phraseTimer !== null) {
    window.clearInterval(phraseTimer);
    phraseTimer = null;
  }
}

function playChimePhrase(ctx: AudioContext) {
  const start = ctx.currentTime + 0.05;
  const noteGap = 0.11;
  const noteLen = 0.38;

  CHIME_NOTES_HZ.forEach((freq, index) => {
    const t = start + index * noteGap;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.22, t + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + noteLen);
    osc.start(t);
    osc.stop(t + noteLen + 0.05);
  });
}

async function startSynthesizedRingtone() {
  if (!active) return;

  audioContext = new AudioContext();
  try {
    await audioContext.resume();
  } catch {
    // autoplay may stay suspended until user gesture
  }

  if (!active || !audioContext) return;

  playChimePhrase(audioContext);
  phraseTimer = window.setInterval(() => {
    if (active && audioContext) {
      void audioContext.resume().catch(() => {});
      playChimePhrase(audioContext);
    }
  }, PHRASE_INTERVAL_MS);
}

function stopSynthesized() {
  clearPhraseTimer();
  if (audioContext) {
    void audioContext.close().catch(() => {});
    audioContext = null;
  }
}

function stopMp3() {
  if (!mp3Audio) return;
  mp3Audio.pause();
  mp3Audio.currentTime = 0;
  mp3Audio.src = "";
  mp3Audio = null;
}

async function tryCustomMp3(): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio(CUSTOM_RINGTONE_URL);
    audio.loop = true;
    audio.volume = 0.9;
    audio.preload = "auto";

    const onReady = () => {
      if (!active) {
        resolve(false);
        return;
      }
      mp3Audio = audio;
      void audio
        .play()
        .then(() => resolve(true))
        .catch(() => resolve(false));
    };

    audio.addEventListener("canplaythrough", onReady, { once: true });
    audio.addEventListener(
      "error",
      () => resolve(false),
      { once: true },
    );
    audio.load();
  });
}

/** Loop incoming video-call ringtone until {@link stopIncomingCallRingtone}. */
export async function startIncomingCallRingtone() {
  if (typeof window === "undefined" || active) return;
  active = true;

  const usedMp3 = await tryCustomMp3();
  if (usedMp3 && active) return;

  stopMp3();
  await startSynthesizedRingtone();
}

/** Stop ringtone (join, dismiss, or alert cleared). */
export function stopIncomingCallRingtone() {
  active = false;
  stopMp3();
  stopSynthesized();
}
