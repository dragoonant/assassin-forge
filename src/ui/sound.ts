import { useEffect, useState } from 'react';

// Generated audio is installed to src/assets/audio/<music|sfx>/<id>.mp3 by scripts/audio/install.py.
// Missing files are skipped silently, so the game works with no audio at all.
const files = import.meta.glob('../assets/audio/**/*.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const index = new Map<string, string>();
for (const [file, url] of Object.entries(files)) {
  const m = /audio\/(music|sfx)\/([\w-]+)\.mp3$/.exec(file);
  if (m) index.set(`${m[1]}/${m[2]}`, url);
}

const PREFS_KEY = 'recollection.sound.v1';
const MUSIC_VOLUME = 0.45;
const SFX_VOLUME = 0.7;
const FADE_MS = 700;

interface Prefs {
  music: boolean;
  sfx: boolean;
}

function loadPrefs(): Prefs {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}');
    return { music: p.music !== false, sfx: p.sfx !== false };
  } catch {
    return { music: true, sfx: true };
  }
}

class Sound {
  prefs: Prefs = loadPrefs();
  private listeners = new Set<() => void>();
  private track: HTMLAudioElement | null = null;
  private trackId: string | null = null;
  private wanted: string | null = null;
  private lastPlayed = new Map<string, number>();

  constructor() {
    // Browsers block audio until the first click or key press; start the wanted track then.
    const unlock = () => {
      if (this.wanted && !this.track) this.music(this.wanted);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('pointerdown', unlock);
      window.addEventListener('keydown', unlock);
    }
  }

  has(kind: 'music' | 'sfx', id: string): boolean {
    return index.has(`${kind}/${id}`);
  }

  /** Loops a music track, crossfading from the current one. null stops the music. */
  music(id: string | null): void {
    this.wanted = id;
    if (id === this.trackId && this.track) return;
    this.fadeOut(this.track);
    this.track = null;
    this.trackId = null;
    const url = id && this.prefs.music ? index.get(`music/${id}`) : undefined;
    if (!url) return;
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0;
    this.track = audio;
    this.trackId = id;
    audio.play().then(() => this.fadeTo(audio, MUSIC_VOLUME)).catch(() => {
      // Autoplay was blocked: forget this attempt and retry on the next interaction.
      if (this.track === audio) {
        this.track = null;
        this.trackId = null;
      }
    });
  }

  /** A one-shot music cue (victory, defeat) that replaces the current track. */
  stinger(id: string): void {
    this.music(null);
    const url = this.prefs.music ? index.get(`music/${id}`) : undefined;
    if (url) new Audio(url).play().catch(() => {});
  }

  sfx(id: string): void {
    const url = this.prefs.sfx ? index.get(`sfx/${id}`) : undefined;
    if (!url) return;
    // Rapid repeats (several clashes in one tick, 4x speed) collapse into one sound.
    const now = performance.now();
    if (now - (this.lastPlayed.get(id) ?? 0) < 150) return;
    this.lastPlayed.set(id, now);
    const a = new Audio(url);
    a.volume = SFX_VOLUME;
    a.play().catch(() => {});
  }

  set(key: keyof Prefs, on: boolean): void {
    this.prefs = { ...this.prefs, [key]: on };
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs));
    } catch {
      // Preference just won't persist.
    }
    if (key === 'music') {
      const wanted = this.wanted;
      this.music(null);
      if (on) this.music(wanted);
      this.wanted = wanted;
    }
    this.listeners.forEach((l) => l());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private fadeTo(a: HTMLAudioElement, target: number): void {
    const start = a.volume;
    const t0 = performance.now();
    const step = () => {
      const k = Math.min(1, (performance.now() - t0) / FADE_MS);
      a.volume = start + (target - start) * k;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  private fadeOut(a: HTMLAudioElement | null): void {
    if (!a) return;
    this.fadeTo(a, 0);
    setTimeout(() => a.pause(), FADE_MS + 50);
  }
}

export const sound = new Sound();

/**
 * Plays a music track while the calling component is on screen. Pass undefined to leave the music alone
 * (child components' effects run first, so a parent must not override them).
 */
export function useMusic(id: string | null | undefined): void {
  useEffect(() => {
    if (id !== undefined) sound.music(id);
  }, [id]);
}

export function useSoundPrefs(): Prefs {
  const [prefs, setPrefs] = useState(sound.prefs);
  useEffect(() => sound.subscribe(() => setPrefs(sound.prefs)), []);
  return prefs;
}
