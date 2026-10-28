// Generated art is dropped into src/assets/art/<kind>/<id>.<ext> by scripts/art/generate.mjs.
// Anything missing simply renders without art.
const files = import.meta.glob('../assets/art/**/*.{png,webp,jpg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const index = new Map<string, string>();
for (const [file, url] of Object.entries(files)) {
  const m = /art\/([\w-]+)\/([\w-]+)\.\w+$/.exec(file);
  if (m) index.set(`${m[1]}/${m[2]}`, url);
}

export const cardArt = (cardId: string): string | undefined => index.get(`cards/${cardId}`);
/** Story speakers who have their own card: their card art doubles as the portrait. */
const SPEAKER_CARDS: Record<string, string> = {
  Isotta: 'isotta-ferro', Machiavelli: 'machiavelli', Giovanni: 'giovanni-bande-nere', Cellini: 'benvenuto-cellini',
  Fiammetta: 'fiammetta-orsetti', Vescari: 'ermanno-vescari', Pietro: 'pietro-il-gatto',
};

export const portraitArt = (speaker: string): string | undefined =>
  index.get(`portraits/${slug(speaker)}`) ?? (SPEAKER_CARDS[speaker] ? cardArt(SPEAKER_CARDS[speaker]) : undefined);
export const sceneArt = (battleId: string): string | undefined => index.get(`scenes/${battleId}`);

export function slug(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
